# Void — Current Stage

Last updated: 2026-09-19

---

## Status Summary

**Version:** 1.10.0 (released Sept 11, 2026)
**GitHub:** [andrew009garfield-ctrl/void](https://github.com/andrew009garfield-ctrl/void)
**Website:** [alexishq.in](https://alexishq.in)
**Docs:** [docs.alexishq.in](https://docs.alexishq.in)

---

## What Works

- **Firebase authentication:** Email/password and Google Sign-in, persists across restarts
- **Rebranding complete:** OpenWhispr → Void, purple theme applied, all native code rebranded (`com.void.*`)
- **App builds successfully:** AppImage + deb (Linux), Electron 41 + React 19 + Tailwind v4
- **Local STT:** whisper.cpp, Parakeet, Orukeet (recommended), Cohere Transcribe all bundled
- **Cloud STT:** OpenAI (gpt-transcribe default), Deepgram, AssemblyAI, Gemini Live — all BYOK
- **Local LLM:** llama.cpp server with GGUF models (Qwen, Llama, Mistral, GPT-OSS)
- **Cloud LLM:** OpenAI, Anthropic (IPC bridge), Gemini, Groq, Bedrock, Azure — all BYOK
- **Voice assistant:** Hotkey-triggered, streams to AI panel, supports screen context capture
- **Meeting transcription:** Event-driven mic/process detection, echo leak detector, diarization
- **Calendar sync:** Google Calendar + Microsoft Calendar managers complete (need OAuth setup)
- **Apple Calendar:** macOS EventKit integration via Swift helper
- **Notes:** Rich text editor (TipTap), AI Summary, Detailed Notes, Follow-up Email actions
- **Semantic search:** Qdrant + all-MiniLM-L6-v2, hybrid FTS5 + vector search with RRF
- **Onboarding:** Rebuilt flow (dictation → notes → assistant demo), keeps progress
- **i18n:** 11 languages including Arabic with full RTL layout
- **Platform support:** macOS (arm64 + x64), Windows (x64), Linux (AppImage, deb, rpm, tar)
- **Wayland hotkeys:** GNOME, Hyprland, KDE integration via D-Bus
- **Auto-updates:** Background download, install on quit (AppImage on Linux)
- **CLI bridge:** Loopback HTTP server for terminal transcription

---

## What Does Not Work / Is Not Complete

1. **Void Cloud API** — Not deployed. All cloud features return "Void API URL not configured"
2. **Google Calendar OAuth** — Code complete, but no OAuth credentials configured in Google Cloud Console
3. **Microsoft Calendar OAuth** — Code complete, but no Azure AD app registration
4. **Apple Calendar** — Code exists, but not end-to-end tested on macOS
5. **Cloud notes sync** — Requires Void Cloud API
6. **Team spaces** — Requires Void Cloud API
7. **Admin dashboard** — Not built yet (planned for Cloudflare Pages)
8. **Dictation end-to-end** — Auth works, but dictation pipeline not fully tested with all engine combinations
9. **macOS .icns icon** — Requires macOS build machine to compile
10. **Logo** — Basic/functional, needs professional redesign

---

## Current Blockers

| Blocker | Impact | Path to Resolution |
|---|---|---|
| Void Cloud API not deployed | No cloud features | Deploy API on Cloudflare Workers + Neon DB |
| Google OAuth credentials missing | No calendar sync | Create credentials in Google Cloud Console |
| OAuth redirect_uri_mismatch | Google sign-in may fail for some flows | Complete testing of oauthLoopbackFlow.js fix |
| No macOS build machine | Cannot build .dmg or .icns | Set up macOS CI or local machine |

---

## What Was Done Last (Sept 15-16 Session)

1. Created Firebase project (`void-auth-app-2`, asia-south1 Mumbai)
2. Migrated auth from Better Auth to Firebase (fixed 4 root causes)
3. Full rebranding: OpenWhispr → Void in all code, configs, and native binaries
4. Purple theme applied (gradient, tokens, keyframes)
5. New logo generated from user's design
6. Removed founder references from 6 languages
7. Verified app signs in and persists auth

---

## Next Steps (Priority Order)

### Immediate (P0)
1. Verify STT/LLM options appear in settings after sign-in
2. Test full dictation pipeline end-to-end
3. Complete OAuth redirect_uri_mismatch testing

### Short-term (P1)
4. Deploy Void Cloud API (Cloudflare Workers + Neon)
5. Configure Google Calendar OAuth credentials
6. Configure Microsoft Calendar OAuth credentials
7. Test Apple Calendar on macOS

### Medium-term (P2)
8. Replace Yowza font with Plus Jakarta Sans (open source)
9. Compile macOS .icns icon
10. Build and deploy admin dashboard
11. Professional logo redesign
12. Test Linux clipboard paste across all compositors
13. Full dictation test matrix (all engines × local/cloud)

### Long-term (P3)
14. UI differentiation (teal palette shift per VOID-UI-DIFFERENTIATION.md)
15. Custom wake word detection
16. Batch transcription
17. Export formats beyond clipboard

---

## Key Files for Current Work

| File | Recent Changes |
|---|---|
| `src/hooks/useAuth.ts` | Rewritten for Firebase auth |
| `src/lib/firebase.ts` | Added `authReady` promise |
| `src/stores/policyRules.ts` | Fixed non-managed user filters |
| `src/AppRouter.jsx` | `mirrorActiveAccountScope` for both windows |
| `src/components/AuthenticationStep.tsx` | Email verification skipped |
| `src/components/OnboardingFlow.tsx` | Cloud health check skipped |
| `.env` | Firebase config, LOCAL_TRANSCRIPTION_PROVIDER=nvidia |
| `.env.example` | OpenWhispr references removed |
| `electron-builder.json` | Gizmo Labs signing removed |
| `README.md` | OpenWhispr attribution added |
| `LICENSE` | OpenWhispr attribution added |

---

## Environment Configuration

**`.env` settings:**
- `LOCAL_TRANSCRIPTION_PROVIDER=nvidia` (Parakeet active)
- Firebase config (API key, project ID, etc.)
- `VOID_LOG_LEVEL=debug` (for development)

**Firebase project:** `void-auth-app-2`
- Region: asia-south1 (Mumbai)
- Auth providers: Google Sign-in, Email/Password
- Firestore: Standard edition, nam5 region, production mode
- Authorized domains: localhost, alexishq.in

---

## Repository State

- **Branch:** main (GitHub: andrew009garfield-ctrl/void)
- **Build status:** AppImage + deb build successfully
- **Node version:** 24 (pinned in `.nvmrc`)
- **Package version:** 1.10.0
- **License:** MIT (with OpenWhispr attribution)

---

## Related Project Documents

- `PLAN.md` — Original project plan (Sept 15, 2026)
- `VOID-UI-DIFFERENTIATION.md` — UI/UX differentiation report (palette recommendations)
- `CLAUDE.md` — Technical reference for AI assistants (comprehensive)
- `CHANGELOG.md` — Full changelog (v1.10.0 + unreleased)
- `DEBUG.md` — Debug mode documentation
- `TROUBLESHOOTING.md` — Troubleshooting guide
- `SECURITY.md` — Security documentation
- `LOCAL_WHISPER_SETUP.md` — Local whisper.cpp setup guide
