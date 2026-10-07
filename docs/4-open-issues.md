# Void — Open Issues

Last updated: 2026-09-19

---

Ranked by priority (P0 = critical/blocking, P3 = low/nice-to-have).

---

## P0 — Critical / Blocking

### 1. Void Cloud API Not Deployed
- **Impact:** All cloud features return "Void API URL not configured" errors
- **Affects:** Cloud STT, cloud LLM, cloud sync, team features
- **Status:** Auth server deployed on Cloudflare Workers (`void-auth.andrew009garfield.workers.dev`), D1 database created, but full API not yet live
- **Next:** Deploy the Cloud API proxy for STT/AI/TTS

### 2. Google OAuth Redirect URI Mismatch
- **Impact:** Google sign-in fails for some flows
- **Root cause:** Hardcoded fallback URLs to `auth.alexishq.in` across 74K lines of code
- **Status:** `oauthLoopbackFlow.js` fix applied, needs end-to-end testing
- **Files:** Multiple files with hardcoded auth URLs being fixed one by one

### 3. STT Settings Verification Pending
- **Impact:** STT/LLM options may not appear in settings when signed in
- **Status:** Auth fixes applied (setActiveAccountScope, policyRules fixes), but not yet verified in the live app
- **Next:** Manual verification that settings page shows all provider options after sign-in

---

## P1 — High Priority

### 4. Cloud API Not Deployed (Cloudflare Workers Auth Server)
- **Impact:** No cloud STT/LLM/notes sync
- **Status:** Auth server is running, but the full application API is not deployed
- **Next:** Deploy the backend API for cloud features

### 5. Google Calendar OAuth Setup Incomplete
- **Impact:** Calendar sync and meeting reminders not functional
- **Root cause:** Needs OAuth client ID from Google Cloud Console
- **Status:** Google Calendar manager code is complete (`googleCalendarManager.js`), but no OAuth credentials configured
- **Next:** Create OAuth credentials in Google Cloud Console, configure redirect URIs

### 6. Microsoft Calendar OAuth Setup Missing
- **Impact:** Microsoft 365 calendar integration non-functional
- **Status:** `microsoftCalendarManager.js` is complete, but no Azure AD app registration
- **Next:** Register Azure AD app, configure OAuth flow

### 7. Apple Calendar Integration (macOS Only)
- **Impact:** No Apple Calendar support for macOS users
- **Status:** `appleCalendarManager.js` and `macos-calendar-listener.swift` exist, but end-to-end testing needed
- **Next:** Test on macOS with real calendar data

---

## P2 — Medium Priority

### 8. Plus Jakarta Sans Font Replacement
- **Impact:** Current Yowza font is brand-specific and licensed; fallback to Noto Sans is less polished
- **Status:** Plan to replace with Plus Jakarta Sans (open source, modern)
- **Files:** `src/brandFonts.ts`, `src/index.css`

### 9. macOS .icns Compilation
- **Impact:** macOS builds use generic icon
- **Root cause:** Requires macOS build machine to compile `.icns` format
- **Status:** Logo SVGs exist in `src/assets/logo.svg`, need `.icns` conversion
- **Next:** Set up macOS CI or local machine for icon compilation

### 10. Admin Dashboard Not Deployed
- **Impact:** No admin interface for user/workspace management
- **Status:** Planned for Cloudflare Pages
- **Next:** Build and deploy admin dashboard

### 11. End-to-End Dictation Testing
- **Impact:** Core feature (voice dictation) not fully tested with all engines
- **Status:** App builds and signs in, but dictation pipeline not verified with all model combinations
- **Next:** Test whisper.cpp, Parakeet, Orukeet, Cohere locally + cloud providers

### 12. Linux Build Verification
- **Impact:** Linux packages may have issues
- **Status:** AppImage and deb built successfully, but clipboard paste and Wayland hotkeys need testing
- **Platforms:** X11, GNOME Wayland, Hyprland, KDE Wayland

---

## P3 — Low Priority / Nice-to-Have

### 13. Logo Redesign
- **Impact:** Current logo is basic/functional, not polished
- **Status:** Purple waveform + concentric circles icon exists, needs professional refinement
- **Files:** `src/assets/logo.svg`, `src/assets/icons/`

### 14. Void Brand Assets CI Pipeline
- **Impact:** Brand fonts (Yowza) fetched at build time from private release; builds without access fall back to Noto Sans silently
- **Status:** `scripts/download-brand-fonts.js` handles graceful fallback
- **Nice-to-have:** Self-hosted font pipeline for CI

### 15. Nix Build Environment
- **Impact:** `flake.nix` exists for reproducible builds, but not all developers use Nix
- **Status:** Working but not tested on all platforms

### 16. Winget Manifests (Windows)
- **Impact:** Windows package manager distribution
- **Status:** CI publishes manifests with tag-pinned URLs (fixed in 1.10.0)
- **Status:** Working post-fix

### 17. Insights Leaderboard Privacy
- **Impact:** Opt-in leaderboard shows dictation activity comparison
- **Status:** Implemented with explicit join/leave, share card shows name/email only
- **Note:** Currently working as designed

### 18. Granola Import Collision Handling
- **Impact:** Notes with same title/date could collide
- **Status:** Fixed in 1.10.0 — deterministic versioned IDs allocated across sorted files
- **Status:** Resolved

### 19. Deepgram Key Presentation Bug
- **Impact:** BYOK Deepgram connections failed with 401
- **Root cause:** Key presented as `Bearer` instead of `Token` scheme
- **Status:** Fixed in 1.10.0
- **Status:** Resolved

---

## Known Limitations (By Design)

### Intel Macs
- Live speaker identification and voice fingerprinting unavailable (ONNX Runtime dropped x86_64 macOS binaries in v1.24)
- Meetings still record and transcribe normally
- Notes search falls back to keyword matching (no semantic search)

### Wayland (Linux)
- Push-to-talk not supported on GNOME/Hyprland/KDE Wayland (compositor only fires toggle events)
- Screen context capture silently skipped on Linux Wayland (desktopCapturer not supported)

### Local Semantic Search
- Only available through the AI agent's `search_notes` tool, not the manual search UI
- Requires Qdrant binary running as sidecar

---

## Technical Debt

1. **Better Auth remnants** — `@better-auth/sso` still in dependencies, code paths may exist
2. **OpenWhispr naming** — Some internal references still use OpenWhispr naming conventions
3. **i18n strings** — Removed "Gabe the founder" from 6 languages, but other founder references may exist
4. **Test coverage** — Several helper modules have unit tests, but no integration/E2E test suite
5. **Package-lock.json** — Must be regenerated with Node 24 only (breaking if different major version used)
