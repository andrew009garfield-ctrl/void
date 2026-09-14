# Void — Project Plan (Sept 15, 2026)

## Current Status
- OpenWhispr codebase cloned and rebranded to Void (987 source files)
- Auth server deployed on Cloudflare Workers: https://void-auth.andrew009garfield.workers.dev
- D1 database created with schema (users, sessions, usage, notes, meetings)
- Google OAuth configured (Client ID + Secret stored as Cloudflare secrets)
- App builds successfully (AppImage + deb)
- Purple theme applied
- Logo created (basic, needs redesign)
- GitHub repo: https://github.com/andrew009garfield-ctrl/void

## Blocker: Google OAuth redirect_uri_mismatch
The auth system is deeply integrated across 74K lines. Multiple files have hardcoded fallback URLs to auth.alexishq.in that we've been fixing one by one. The latest fix (oauthLoopbackFlow.js) should resolve it, but needs testing.

## What We Have
1. **Auth server** — Cloudflare Worker with D1 database, Google OAuth working
2. **App code** — OpenWhispr rebranded, builds, purple theme
3. **Domain** — alexishq.in on BigRock, nameservers pointing to Cloudflare
4. **API keys** — Deepgram, APInex (for agent chat)
5. **Logo** — Basic, needs professional redesign

## What We Need to Decide
1. **Auth approach** — Keep fixing OpenWhispr's auth OR simplify/remove
2. **UI differentiation** — How much to change from OpenWhispr for commercial sale
3. **Feature scope** — Full OpenWhispr features OR focused subset
4. **Timeline** — When do we need a working version

## Next Steps (When Ready)
1. Test the current build with the oauthLoopbackFlow.js fix
2. If auth works, proceed with testing full app functionality
3. If auth still fails, consider alternatives (remove auth, simplify, or hire help)
4. Redesign logo and UI for commercial differentiation
5. Set up auth.alexishq.in when DNS propagation completes
6. Add Microsoft OAuth
7. Deploy API proxy for STT/AI/TTS

## Decision Needed
Which auth approach to take:
- A) Keep fixing OpenWhispr's auth (risky, complex, time-consuming)
- B) Remove auth entirely (simplest, loses cloud features)
- C) Build simpler auth from scratch (medium effort, clean)
- D) Use a third-party auth service (Clerk, Supabase Auth)
