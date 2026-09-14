# Code Review: Void Rebrand Session

**Reviewer:** Application Security Engineer  
**Date:** September 15, 2026  
**Scope:** `git diff HEAD~3 HEAD` — 31 files, +673/−98 lines  
**Changes reviewed:** Domain (void-app.com → alexishq.in), AppID (gizmolabs → microsive), Color palette (purple → Ocean Teal), Typography (Yowza → Plus Jakarta Sans)

---

## CRITICAL

### C1. CI/CD Workflows Still Reference Old Auth Domain
**Severity:** CRITICAL  
**Files:** `.github/workflows/release.yml` (lines 142, 252, 373), `.github/workflows/build-and-notarize.yml` (lines 135, 248, 378)  
**Description:** Six occurrences of `VITE_AUTH_URL: ${{ vars.VITE_AUTH_URL || 'https://auth.void-app.com' }}`. If the `VITE_AUTH_URL` GitHub variable is not set, production builds will build with the old auth domain as fallback. This breaks authentication for all users whose builds use the default.  
**Recommendation:** Update all fallback values to `https://auth.alexishq.in`. Ensure the `VITE_AUTH_URL` GitHub variable is also set.

---

## HIGH

### H1. Signal Glow CSS Incomplete Purple → Teal Conversion
**Severity:** HIGH  
**File:** `src/styles/dictation-panel.css` (lines 310, 312, 327–329)  
**Description:** The `.processing-signal-glow` block was partially updated. `--signal-core` was changed to `#0d9488` (teal), but three other signal variables remain purple:
- Line 310: `--signal-bright: #c084fc` (purple 300) — should be `#5eead4` (teal 300)
- Line 312: `--signal-deep: #7c3aed` (purple 600) — should be `#0d9488` (teal 600)
- Line 327: `--signal-core: #8787ff` (blue-purple) — should be `#14b8a6` (teal 500)
- Line 328: `--signal-deep: #7c3aed` (purple 600) — should be `#0d9488` (teal 600)

**Impact:** The dictation processing glow animation renders with a purple-teal hybrid gradient. Users see a visible brand inconsistency during the primary interaction (voice dictation).

### H2. App Icon Still Entirely Purple
**Severity:** HIGH  
**File:** `src/assets/void.icon.svg`  
**Description:** The SVG app icon (tray, dock, about dialog) is entirely purple-themed with no changes from the rebrand:
- Background: `#1e1b4b` → `#312e81` (indigo/purple)
- Sound waves: `#818cf8`, `#a78bfa`, `#6366f1`, `#8b5cf6`, `#4f46e5`, `#7c3aed`
- Microphone: `#c4b5fd` → `#818cf8` (purple)
- Glow: `#6366f1`

**Impact:** The most visible brand asset (tray icon users see daily) still communicates "purple app" — the opposite of the rebrand intent.

### H3. README, SECURITY.md, CONTRIBUTING.md Still Reference void-app.com
**Severity:** HIGH  
**Files:** `README.md` (11 occurrences), `SECURITY.md` (1), `.github/CONTRIBUTING.md` (3)  
**Description:** All public-facing documentation still references `void-app.com`, `docs.void-app.com`, and `security@void-app.com`. Contributors and users visiting the GitHub repo see the old brand.
**Recommendation:** Update all documentation URLs and contact emails to alexishq.in equivalents.

### H4. Google Fonts CDN Dependency in Electron App
**Severity:** HIGH  
**File:** `src/index.html` (lines 7–9)  
**Description:** Plus Jakarta Sans is loaded from `fonts.googleapis.com` / `fonts.gstatic.com`. For a desktop Electron app this introduces:
1. **External network dependency** — Font won't load offline or behind strict firewalls
2. **Privacy concern** — Google receives a request every time the app window renders
3. **Performance** — Adds a render-blocking network request on startup

The original Yowza font was bundled locally via `brandFonts.ts`. The PLUS-UI-DIFFERENTIATION.md design doc recommended local bundling.
**Recommendation:** Download Plus Jakarta Sans woff2 files and bundle locally using `@font-face` in CSS, removing the Google Fonts `<link>` tags.

---

## MEDIUM

### M1. SpectrogramCard Hardcoded Purple
**Severity:** MEDIUM  
**File:** `src/components/referral-cards/SpectrogramCard.tsx` (line 201–203)  
**Description:** The spectrogram playback indicator uses hardcoded `oklch(0.72 0.22 260)` — purple hue 260. This renders a purple playback line on the referral card's spectrogram visualization.
**Recommendation:** Change to `oklch(0.72 0.16 175)` (teal equivalent) or use `var(--color-primary)`.

### M2. Accent Bar Gradient Mixed Colors
**Severity:** MEDIUM  
**File:** `src/index.css` (lines 1074–1075)  
**Description:** The accent bar gradient has an inconsistent color transition:
```css
oklch(0.65 0.18 175 / 0.5),  /* teal (175) — correct */
oklch(0.7 0.18 280 / 0.3),   /* purple (280) — stale */
transparent 80%
```
The first stop was updated to teal, but the midpoint retains purple hue 280.
**Recommendation:** Change `oklch(0.7 0.18 280 / 0.3)` to `oklch(0.65 0.15 185 / 0.3)` (teal 500 mid-tone).

### M3. Onboarding Font Stack Still References Yowza
**Severity:** MEDIUM  
**File:** `src/index.css` (lines 293–298)  
**Description:** The onboarding canvas overrides `--font-family-sans` with `"Yowza"` as the first entry:
```css
--font-family-sans:
    "Yowza", "Inter Variable", "Noto Sans", ...
```
The comment on line 293 also says "Inter sits behind Yowza as the onboarding fallback." The rest of the app was changed to use "Plus Jakarta Sans."
**Impact:** Onboarding pages render in Yowza (if bundled) or fall through to Inter, creating an inconsistent typographic experience vs. the main app.

### M4. Network Allowlist Documentation Stale
**Severity:** MEDIUM  
**File:** `docs/network-allowlist.md` (lines 15–16, 51, 106)  
**Description:** Still lists `api.void-app.com`, `auth.void-app.com`, and `void-app.com` as required domains. Enterprise customers who restrict network access will configure firewalls for the wrong domains.
**Recommendation:** Update all domain references to alexishq.in equivalents.

### M5. brandFonts.ts and Yowza Font Script Are Dead Code
**Severity:** MEDIUM  
**Files:** `src/brandFonts.ts`, `scripts/download-brand-fonts.js`, `src/assets/fonts/yowza/`  
**Description:** `brandFonts.ts` still registers Yowza font faces via `@font-face` injection. `download-brand-fonts.js` still fetches Yowza `.otf` files from a private release. These are now dead code since the CSS uses Plus Jakarta Sans. They add build-time overhead and confusion.
**Recommendation:** Remove or update `brandFonts.ts` to register Plus Jakarta Sans instead. Remove or archive the Yowza download script.

### M6. Japanese Locale `dnsBlocked` Text Contains English Fragment
**Severity:** MEDIUM  
**File:** `src/locales/ja/translation.json` (line 587)  
**Description:** The `dnsBlocked` error message reads: `"DNS が the server を解決できません — 広告ブロッカーやフィルターに遮断されている可能性があります。"`. The phrase "the server" is English in the middle of Japanese text. This appears to be a pre-existing translation artifact (not introduced by this rebrand), but it's now more visible since other locale files were touched.

---

## LOW

### L1. Download Script Still References Yowza
**Severity:** LOW  
**File:** `scripts/download-brand-fonts.js`  
**Description:** Script still contains `const TAG = "yowza-v1"` and lists 5 Yowza `.otf` files. Dead code in the build pipeline.

### L2. Yowza Font README Still Present
**Severity:** LOW  
**File:** `src/assets/fonts/yowza/README.md`  
**Description:** Documentation for a font that is no longer the brand face. May confuse future contributors.

### L3. PLAN.md References Old Domain
**Severity:** LOW  
**File:** `PLAN.md` (line 14)  
**Description:** Historical note references `auth.void-app.com`. Acceptable as project history but should note the rebrand.

### L4. PLAN.md References Broken Domain (Pre-existing)
**Severity:** LOW  
**File:** `PLAN.md` (line 14)  
**Description:** Mentions "hardcoded fallback URLs to auth.void-app.com" — this is historical context and not actionable, but the referenced auth worker URL (`void-auth.andrew009garfield.workers.dev`) is still used in 6 source files as a backend endpoint.

### L5. Admin URL Hardcoded Fallback
**Severity:** LOW  
**File:** `src/lib/auth.ts` (line 286)  
**Description:** `ADMIN_URL` has hardcoded fallback `https://admin.alexishq.in`. While `import.meta.env.VITE_ADMIN_URL` is checked first, the hardcoded value should ideally be in an env var too for consistency. Minor since the app handles this gracefully.

---

## Summary

| Severity | Count | Key Action |
|----------|-------|------------|
| CRITICAL | 1 | Fix CI/CD auth URL fallbacks before next release |
| HIGH | 4 | Fix signal glow CSS, icon SVG, docs, font bundling |
| MEDIUM | 6 | Fix accent gradient, onboarding font, dead code cleanup |
| LOW | 5 | Documentation and minor cleanup |

**Top 3 blocking items before ship:**
1. **C1** — CI/CD builds will fail auth if `VITE_AUTH_URL` var isn't set
2. **H1** — Signal glow renders purple-teal hybrid during dictation
3. **H2** — App icon/tray is still purple (most visible brand touchpoint)
