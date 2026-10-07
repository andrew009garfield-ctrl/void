# Void — Alternatives & Design Decisions

Last updated: 2026-09-19

---

This document records areas where multiple options existed and the rationale for each choice.

---

## 1. Authentication System

**Status:** Firebase (current) — migrated from Better Auth

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **A) Keep fixing OpenWhispr's Better Auth** | Existing code, familiar | Deeply integrated across 74K lines, hardcoded fallbacks to auth.alexishq.in, `setActiveAccountScope` never wired to Firebase, policyStatus stuck "idle", complex race conditions | Rejected |
| **B) Remove auth entirely** | Simplest, no auth complexity | Loses cloud features, team spaces, cloud sync | Rejected |
| **C) Build simpler auth from scratch** | Clean, tailored | Medium effort, reinventing the wheel | Rejected |
| **D) Third-party auth (Clerk, Supabase Auth)** | Managed, well-documented | Vendor lock-in, new dependency | Considered |
| **E) Firebase Auth (chosen)** | Google Sign-in + Email/Password, free tier, Firestore integration, Asia region (Mumbai), works with existing Google Cloud setup | Requires Firebase project, learning curve for Firestore rules | **Selected** |

**Key changes in migration:**
- `useAuth.ts` now calls `setActiveAccountScope` after `authSetToken`
- `firebase.ts` exports `authReady` promise to prevent persistence race
- `policyRules.ts` fixed to allow all options for non-managed users
- Email verification skipped for testing phase
- Cloud health check skipped during onboarding

---

## 2. UI Theme / Brand Color

**Status:** Purple (current) — with documented recommendation to move to teal

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Blue (OpenWhispr original)** | Familiar, clean | Identical to source project | Rejected |
| **Teal/Ocean (recommended)** | Differentiated from both Wispr Flow (forest) and OpenWhispr (blue), warm undertone | Would require full theme rewrite | Documented as ideal |
| **Purple (#8b5cf6 → #6d28d9) (chosen)** | Fast to implement, tech-forward feel | Sits in same violet/indigo category as competitors | **Current** |

**Future consideration:** The `VOID-UI-DIFFERENTIATION.md` document proposes a full palette shift to ocean teal (hue 175-195) with detailed token replacements for both light and dark mode.

---

## 3. Local Speech-to-Text Model

**Status:** Orukeet (recommended default)

| Model | WER | Size | Languages | Speed | Decision |
|---|---|---|---|---|---|
| whisper.cpp (tiny) | Highest | ~75MB | 59 | Fastest | Low-resource option |
| whisper.cpp (base) | Moderate | ~142MB | 59 | Fast | Default fallback |
| **Orukeet** | Low | ~672MB | 25+ | Fast (173ms on M-series) | **Recommended default** |
| Parakeet TDT 0.6b | Low | ~680MB | 25 | Fast (230ms on M-series) | Strong multilingual |
| Cohere Transcribe | Lowest (5.42%) | ~2.7GB on disk | 14 | Slower | Most accurate, no auto-detect |
| Nemotron Streaming | Low | ~632-650MB | 15 | Streaming | Real-time capability |

**Rationale:** Orukeet is a Parakeet fine-tune recommended by the upstream project. It offers the best balance of accuracy, speed, and size. Cohere Transcribe is more accurate but has no automatic language detection and requires a 1.7GB download.

---

## 4. Cloud STT Provider

| Provider | Latency | Pricing | Decision |
|---|---|---|---|
| OpenAI (gpt-transcribe) | Medium | Per-minute | Default cloud option |
| Deepgram | Low (streaming) | Per-minute, BYOK | Recommended for streaming |
| AssemblyAI | Low (streaming) | Per-minute, BYOK | Strong alternative |
| Gemini Live | Low (streaming) | Google pricing, BYOK | New option |
| Groq | Low | Free tier available | Budget option |

**Key decision:** gpt-transcribe replaced deprecated whisper-1 as the OpenAI default. All cloud providers are bring-your-own-key (BYOK).

---

## 5. Vector Database for Semantic Search

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Qdrant (chosen)** | Fast, embedded binary, Rust performance, cosine similarity | Separate sidecar process, port management | **Selected** |
| SQLite FTS5 | Built-in, no extra process | Keyword-only, no semantic understanding | Used as fallback |
| Chroma | Python ecosystem | Heavier dependency, Python required | Rejected |
| Pinecone | Managed, scalable | Cloud-only, vendor lock-in | Rejected |
| In-memory (HNSW) | No sidecar needed | Limited scale, no persistence | Rejected |

**Architecture:** Qdrant runs as a child process on ports 6333-6350. Combined with FTS5 keyword search via Reciprocal Rank Fusion (K=60, 0.3 cosine threshold). Fallback chain: cloud search → local semantic → FTS5 keyword.

---

## 6. Desktop Framework

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Electron (chosen)** | Cross-platform, mature, huge ecosystem | Large bundle size, memory usage | **Inherited from OpenWhispr** |
| Tauri | Smaller bundle, Rust backend | Limited ecosystem, less mature for complex apps | Considered but not pursued |
| Flutter Desktop | Good performance | Limited desktop ecosystem, no Node.js native modules | Not applicable |
| Neutralinojs | Lightweight | Limited native API access | Not applicable |

**Rationale:** Electron was inherited from OpenWhispr. The app requires deep OS integration (global hotkeys, audio capture, clipboard, calendar sync) which Electron handles well with native modules.

---

## 7. State Management

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Zustand (chosen)** | Minimal, no boilerplate, React-friendly | Less structured than Redux | **Selected** |
| Redux Toolkit | Mature, devtools, structured | Boilerplate, heavier | Rejected |
| Jotai | Atomic model | Less suitable for complex state | Rejected |
| React Context | Built-in | Performance issues at scale | Used for i18n only |

---

## 8. Rich Text Editor (Notes)

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **TipTap (chosen)** | Extensible, good React support, Markdown support | Complexity for simple needs | **Inherited from OpenWhispr** |
| Slate | Powerful, flexible | Steep learning curve | Rejected |
| ProseMirror | Foundation of TipTap | Lower-level, more work | Rejected (TipTap wraps it) |
| CodeMirror | Great for code | Not suited for rich text notes | Rejected |

---

## 9. Clipboard Paste Strategy (Linux)

| Compositor | Primary Tool | Fallback Chain |
|---|---|---|
| **X11** | xdotool | Native uinput → manual clipboard |
| **Hyprland Wayland** | wtype → hyprctl sendshortcut | uinput/ydotool → Shift+Insert |
| **Sway/wlroots** | wtype | uinput/ydotool |
| **GNOME/KDE Wayland** | RemoteDesktop portal keysyms | uinput/ydotool |
| **All Wayland (physical fallback)** | Shift+Insert (layout-safe) | Manual clipboard |

**Design principle:** Never rely on KEY_V in Wayland — keyboard layouts vary, so Shift+Insert is the safe physical fallback.

---

## 10. Global Hotkeys (Linux Wayland)

| Option | Scope | Limitation |
|---|---|---|
| Electron `globalShortcut` | X11 only | Does not work on Wayland |
| `GlobalShortcutsPortal` | GNOME (Wayland) | Electron feature flag, limited |
| **GNOME D-Bus + gsettings** | GNOME (chosen) | Only toggle events, no PTT |
| **Hyprland hyprctl bind** | Hyprland (chosen) | Only toggle events, no PTT |
| **KDE KGlobalAccel D-Bus** | KDE (chosen) | Only toggle events, no PTT |

**Trade-off:** Wayland compositor hotkey integration does not support push-to-talk (key-down/key-up events). Users on GNOME/Hyprland/KDE Wayland are forced into tap-to-talk mode.

---

## 11. Internationalization Framework

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **react-i18next + i18next (chosen)** | Mature, flexible, interpolation support | Learning curve | **Selected** |
| FormatJS | ICU message format | Heavier | Rejected |
| LinguiJS | Compiler-based | More setup | Rejected |
| Built-in React context | No dependency | Manual everything | Rejected |

**Languages supported:** en, es, fr, de, pt, it, ru, zh-CN, zh-TW, Arabic (11 total with full RTL layout for Arabic).

---

## 12. Auto-Update System

| Platform | Strategy |
|---|---|
| macOS | electron-updater + notarization |
| Windows | NSIS installer with electron-updater |
| Linux AppImage | electron-updater with toggle in settings |
| Linux deb/rpm/tar | Package manager (no auto-update toggle) |

**Design decision:** Automatic updates replace the manual update popup. Background download + install-on-quit. Off by default for existing installs, on by default for new installs.

---

## 13. Meeting Echo Cancellation Approach

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Audio-layer correlation (chosen)** | Pure math, no neural net, deterministic | Requires tuning thresholds | **Selected** |
| Neural AEC | Adaptive, learns environment | Heavy, ONNX runtime dependency | Considered for future |
| OS-level AEC | Built-in on some platforms | Inconsistent, not available everywhere | Not reliable |

**Architecture:** `meetingEchoLeakDetector.js` correlates mic chunks against system audio with 0-500ms lag search in 5ms steps. Classifies chunks as `clean_local`, `suspected_render_bleed`, or `double_talk`. Drives chunk muting and per-segment suppression flags. Pure, unit-tested seams for policy tuning.
