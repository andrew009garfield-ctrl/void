# Void — Closed Issues & Completed Work

Last updated: 2026-09-19

---

This document tracks bugs fixed and features completed, primarily from the v1.10.0 release and the Sept 15-16 session.

---

## Sept 15-16 Session (Rebrand + Auth Fix)

### Firebase Authentication Migration
- **Issue:** Old Better Auth session binding system was never wired to Firebase
- **Root causes found:**
  1. `setActiveAccountScope` never called → policyStatus stuck "idle" → loading screen forever
  2. `filterByokProviderOptionsByPolicy` returned empty for non-managed users → STT/LLM options hidden
  3. Firebase persistence race → `setPersistence` not awaited
  4. `isPolicyActionAllowed` blocked loading/error states → setup options unavailable
- **Fixes applied:**
  - `src/hooks/useAuth.ts` — Rewrote for Firebase, added `setActiveAccountScope`
  - `src/lib/firebase.ts` — Added `authReady` promise, persistence await
  - `src/stores/policyRules.ts` — Fixed policy filters for non-manified users
  - `src/AppRouter.jsx` — `mirrorActiveAccountScope` runs for both windows
  - `src/components/AuthenticationStep.tsx` — Skipped email verification for testing
  - `src/components/OnboardingFlow.tsx` — Skipped cloud health check
- **Result:** App signs in with Firebase email/password, auth persists across restarts, policy system doesn't block setup

### Rebranding: OpenWhispr → Void
- Forked repos: `andrew009garfield-ctrl/openwhispr` + `andrew009garfield-ctrl/whisper.cpp`
- Updated 9 download scripts to point to forked repos
- Removed Gizmo Labs signing identity from `electron-builder.json`
- Added OpenWhispr attribution to README and LICENSE
- Rebranded all native code (`com.openwhispr.*` → `com.void.*`) in 7 files
- Rebranded NSIS installer, Linux scripts, macOS plist, Nix packages
- Updated `.env.example` to remove OpenWhispr references
- Removed "Gabe the founder" from onboarding in all 6 languages (en, es, fr, de, pt, it)
- Replaced founder avatar with Void logo in onboarding

### Purple Theme Application
- Purple gradient (`#8b5cf6` → `#6d28d9`) replacing OpenWhispr blue
- Removed parchment tokens, fixed `surface-3` / `border-subtle` hues
- Renamed `ow-wave` keyframe to `void-wave`
- Generated new logo icons from user's design (purple waveform + concentric circles)

### Firebase Project Setup
- Created Firebase project `void-auth-app-2` on `asia-south1` (Mumbai)
- Enabled Google Sign-in + Email/Password authentication
- Created Firestore database (Standard edition, nam5 region, production mode)
- Deployed Firestore security rules (user-scoped)
- Added `localhost` and `alexishq.in` to authorized domains

---

## v1.10.0 Release (Sept 11, 2026)

### Dictation Fixes
- Windows pinned the real microphone again (duplicate device alias issue) — #2180
- Dictation starts listening sooner on Windows (resolved once at launch instead of first press) — #2178
- Learned corrections skip everyday words (common English words no longer learned) — #2178
- Push-to-talk no longer loses a dictation hitting the safety ceiling — #2102
- Cancel button redesigned to pour out of the recording pill — #1886
- Partial Assistant response copy works independently — #2035
- Failed paste no longer costs the transcript (saved to history either way) — #1979
- Windows/Linux media pause/resume no longer blocks the main process — #2073

### Transcription Fixes
- Long local dictations transcribe faster (parallel segment decoding) — #2178
- Local dictation skips FFmpeg decode step (raw 16 kHz PCM tap) — #2179
- Deepgram BYOK key works again (Token vs Bearer scheme fix) — #2140
- AssemblyAI BYOK works in Note Recording again (frame size follows actual sample rate) — #2140
- Local transcription no longer drops parts of recordings (whisper.cpp timestamp fix) — #2150
- Long custom dictionaries were being cut in half (900-char cap removed where not needed) — #1632
- Local dictations echoing dictionary terms instead of transcribing — #1960
- Dictionary-echo check ran even with no dictionary sent — #1929

### Notes Improvements
- AI Summary no longer saves raw transcript as "Enhanced" note
- Detailed Notes prompt rewritten (shorter, sharper, better action items)
- Note editor redesigned (larger title, combined date/attendees capsule, new toolbar)
- Transcript tab always reachable (empty state with Start Recording action)
- New notes start recording automatically
- Generate AI Summary offered after recording ends
- Two new built-in actions: Detailed Notes, Follow-up Email
- Notes created offline no longer take long to reach mobile — #2065
- Granola imports no longer silently drop notes with same title/date — #1955
- Transcript scroll follows live meeting correctly — #1896

### Meetings Improvements
- Recording works again after a renderer reload
- Smoother notification swipe (follows pointer, fades to edge)
- Meeting recordings that went silent partway through on macOS (audio tap watchdog) — #2040
- Playback no longer raises a meeting prompt (aggregate device + background speech exclusion) — #2071

### Onboarding & Accounts
- Onboarding runs dictation, then Notes, then live assistant demo — #2122
- New welcome screen with brand-blue hero
- Voice Assistant wording standardized across onboarding
- Onboarding rebuilt and now keeps your progress — #1984
- Plus-addressed email accounts can now sign in — #2088

### AI Models & Routing
- Voice assistant can read/edit dictionary and snippets — #2119
- Astra and Fable 5.1 available as reasoning models — #2107
- Gemini replies no longer come back empty (multi-part reassembly) — #1969
- Dictation cleanup was sampling at temperature 0.7 (now 0 explicitly) — #2007
- Tinfoil model selection fixed (default model named in registry) — #2018

### Enterprise
- Managed transcription for Azure OpenAI / AI Foundry workspaces — #1964
- Managed enterprise providers no longer require SSO — #1964
- AWS Bedrock failures now explain themselves — #1981

### CLI
- Transcribe files from terminal with local models (`POST /v1/transcribe`) — #2121

### Build & Platform
- Local models download in parallel, progress survives closing window — #1267
- GPU acceleration retry easier to find after crash — #1913
- winget manifests published from CI with tag-pinned URLs — #2089
- Local transcription fixed without VC++ redistributable on Windows — #1687
- Parakeet fixed on machines with older system ONNX Runtime (Windows) — #2074
- Hyprland hotkeys using punctuation now work — #1877
- Auto-paste fixed on GNOME Wayland (ydotool daemon priority) — #2078

### Insights
- History before Insights existed is backfilled — #2075
- Usage Insights view added (opt-in sync) — #1959
- Opt-in leaderboard added — #2011

### Transcription Routing
- Signing in no longer silently reroutes dictation to OpenWhispr Cloud — #2086
- Note recordings no longer go to OpenWhispr Cloud for Local users — #2097
- Note formatting no longer follows dictation cleanup to cloud — #2097

### New Features (v1.10.0)
- Orukeet as recommended local model — #2085, #2114
- Local models 3x faster on Apple silicon (arm64-native ONNX Runtime) — #2116
- gpt-transcribe as new OpenAI default — #2076
- Deepgram and AssemblyAI as streaming BYOK providers — #2063
- Gemini Live streaming dictation — #2062
- Cohere Transcribe as local engine — #1949
- Automatic updates (background download, install on quit) — #2120
- Arabic as 11th UI language (full RTL layout) — #1869
- Yowza brand font + Nucleo icons — #2117
- Managed enterprise speech-to-text — #1964

---

## Historical Bug Fixes (Pre-1.10.0)

- Fixed `afterPack.js` validation for Windows DLL naming
- Added `ow-onnxrt.dll` rename + import table rewrite to avoid Windows System32 ONNX Runtime conflict
- Fixed Linux autostart entry syncing (stale `Exec` path after update)
- Fixed macOS Dock icon flickering (occlusion events misinterpreted)
- Fixed auto-start entry on Windows (read from `executableWillLaunchAtLogin`, not `openAtLogin`)
- Fixed SMAppService login item `requiresApproval` state detection on macOS 13+
- Fixed AppImage/Windows portable relaunch (detached waiter process)
- Multiple Wayland clipboard paste fixes (Hyprland sendshortcut stuck-modifier, wtype fallback chains)
