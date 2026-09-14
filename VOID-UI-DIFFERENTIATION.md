# Void UI/UX Differentiation Report
## Making Void Visually Distinct from OpenWhispr/Wispr Flow

**Date:** September 15, 2026  
**Scope:** src/styles/, src/index.css, src/components/, void-logo/

---

## Competitive Landscape

| Element | OpenWhispr | Wispr Flow | Void (current) |
|---------|-----------|------------|-----------------|
| Primary color | `#2056DF` (blue) | `#034F46` (teal/forest) | `#8b5cf6` (purple) |
| Logo style | Blue square, white circle, mic + bars | Teal/green, abstract flow mark | Purple gradient, mic + waveform bars |
| Typography | System stack (SF Pro) | Figtree + Eb Garamond | "Yowza" + Noto Sans |
| Overall feel | Clean, open-source utilitarian | Polished, restrained, "forest" palette | Purple tech-forward |
| Dark mode | Standard neutral | Soft warm neutrals | Charcoal with hue 260 |

**Problem:** Void's purple `#8b5cf6` palette sits in the same "violet/indigo tech" category that both competitors use or have used. Wispr Flow just rebranded *away* from this exact palette. A purple voice dictation app reads as a Wispr Flow variant, not an independent product.

---

## 1. COLOR PALETTE — Shift Away from Purple

### Recommendation: Warm Indigo → Deep Ocean Teal

The single most impactful change. Move the entire primary from purple (hue 260) to a warm teal/cyan family (hue 175-195). This is the opposite end of the color wheel from Wispr Flow's forest green, and far from OpenWhispr's pure blue.

#### Light Mode Tokens

Replace in `src/index.css` `:root` `@theme` block:

```css
/* === VOID BRAND PALETTE — Ocean Teal === */
@theme {
  --color-primary: #0d9488;           /* Teal 600 — brand anchor */
  --color-primary-foreground: #ffffff;
  --color-secondary: #f0fdfa;         /* Teal 50 — warm neutral */
  --color-secondary-foreground: #134e4a;
  --color-muted: #f0fdfa;
  --color-muted-foreground: #5f7572;
  --color-accent: oklch(0.55 0.16 175);
  --color-accent-foreground: #ffffff;
  --color-agent-brand: #14b8a6;       /* Teal 500 — agent identity */
  --color-destructive: #dc2626;
  --color-destructive-foreground: #ffffff;
  --color-border: #ccfbf1;            /* Teal 100 — warmer than neutral */
  --color-input: #f0fdfa;
  --color-ring: #0d9488;
  --color-background: #ffffff;
  --color-foreground: #1a2e2a;        /* Dark teal-black, not neutral grey */
  --color-card: #ffffff;
  --color-card-foreground: #1a2e2a;
  --color-popover: #ffffff;
  --color-popover-foreground: #1a2e2a;
  --color-link: #0f766e;              /* Teal 700 — link state */
  --color-success: #16a34a;
  --color-success-foreground: #ffffff;
  --color-warning: #d97706;
  --color-warning-foreground: #ffffff;
  --color-info: #0d9488;
  --color-info-foreground: #ffffff;

  /* Surface hierarchy — warm teal undertone */
  --color-surface-0: #ffffff;
  --color-surface-1: #f8fffe;
  --color-surface-2: #ffffff;
  --color-surface-3: #f0fdfa;
  --color-surface-raised: #e6f7f5;
  --color-surface-window: #f5fafa;

  /* Border states */
  --color-border-subtle: #e0f2f1;
  --color-border-hover: #b2dfdb;
  --color-border-active: #0d9488;
}
```

#### Dark Mode Tokens

Replace `.dark` block in `src/index.css`:

```css
.dark {
  /* Dark mode — deep ocean surfaces with teal undertone
     Base L=0.18 (deep navy-teal) with 0.04 steps.
     Hue 175 (teal) with minimal chroma. */
  --color-background: oklch(0.18 0.012 175);
  --color-foreground: oklch(0.92 0.01 175);
  --color-card: oklch(0.22 0.014 175);
  --color-card-foreground: oklch(0.92 0.01 175);
  --color-popover: oklch(0.24 0.015 175);
  --color-popover-foreground: oklch(0.92 0.01 175);
  --color-primary: oklch(0.62 0.14 175);  /* Teal 400 */
  --color-primary-foreground: oklch(0.98 0 0);
  --color-secondary: oklch(0.22 0.013 175);
  --color-secondary-foreground: oklch(0.88 0.01 175);
  --color-muted: oklch(0.20 0.012 175);
  --color-muted-foreground: oklch(0.60 0 0);
  --color-accent: oklch(0.65 0.15 185);
  --color-accent-foreground: oklch(0.98 0 0);
  --color-destructive: oklch(0.62 0.22 25);
  --color-destructive-foreground: oklch(0.98 0 0);
  --color-border: oklch(0.30 0.015 175);
  --color-input: oklch(0.16 0.010 175);
  --color-ring: oklch(0.62 0.14 175);
  --color-success: oklch(0.70 0.18 145);
  --color-success-foreground: oklch(0.98 0 0);
  --color-warning: oklch(0.75 0.15 70);
  --color-warning-foreground: oklch(0.15 0 0);
  --color-info: oklch(0.65 0.13 190);
  --color-info-foreground: oklch(0.98 0 0);

  /* Surface hierarchy */
  --color-surface-0: oklch(0.18 0.012 175);
  --color-surface-1: oklch(0.21 0.013 175);
  --color-surface-2: oklch(0.23 0.014 175);
  --color-surface-3: oklch(0.26 0.015 175);
  --color-surface-raised: oklch(0.29 0.016 175);
  --color-surface-window: oklch(0.16 0.010 175);

  /* Border states */
  --color-border-subtle: oklch(0.28 0.014 175);
  --color-border-hover: oklch(0.38 0.016 175);
  --color-border-active: oklch(0.55 0.12 175);
  --color-link: oklch(0.65 0.10 180);
}
```

#### Brand Glass Gradient

Replace in `:root`:

```css
  /* Void brand glass — teal glass for buttons/mic/send */
  --shadow-brand-glass:
    inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.16),
    inset 0 -1px 1px rgba(0, 0, 0, 0.12);
  --gradient-brand-glass: linear-gradient(180deg, #14b8a6 0%, #0d9488 100%);
  --shadow-brand-tile: var(--shadow-brand-glass), 0 10px 24px -8px rgb(13 148 136 / 0.45);
```

#### Signal Glow (processing animation)

Update in `src/styles/dictation-panel.css`:

```css
.processing-signal-glow {
  --signal-bright: #5eead4;   /* Teal 300 */
  --signal-core: #14b8a6;     /* Teal 500 */
  --signal-deep: #0d9488;     /* Teal 600 */
  --signal-head: #f0fdfa;     /* Teal 50 */
  /* ... rest unchanged */
}

.processing-signal-glow[data-agent="true"] {
  --signal-bright: #2dd4bf;
  --signal-core: #14b8a6;
  --signal-deep: #0d9488;
  --signal-head: #f0fdfa;
}
```

#### Accent Bar & Tilt Card

Update in `src/index.css`:

```css
.dark .accent-bar::before {
  background: linear-gradient(
    90deg,
    oklch(0.62 0.14 175 / 0.5),
    oklch(0.65 0.13 185 / 0.3),
    transparent 80%
  );
}

.tilt-card::after {
  background: conic-gradient(
    from 180deg at 50% 50%,
    oklch(0.62 0.14 175 / 0.2),
    oklch(0.55 0.15 190 / 0.1),
    oklch(0.60 0.12 160 / 0.15),
    oklch(0.55 0.13 200 / 0.1),
    oklch(0.62 0.14 175 / 0.2)
  );
}
```

---

## 2. TYPOGRAPHY — Replace "Yowza" with "Plus Jakarta Sans"

OpenWhispr uses "Yowza" (a casual rounded font). Wispr Flow uses Figtree. Both are geometric sans-serifs. Void should own a different typographic personality: **Plus Jakarta Sans** — a semi-rounded geometric that feels premium and technical without being clinical.

### Font Stack Change

In `src/index.css` `:root`:

```css
  /* Typography — Plus Jakarta Sans is the brand face */
  --font-family-sans:
    "Plus Jakarta Sans", "Inter Variable", "Noto Sans",
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  --font-family-display: "Plus Jakarta Sans", var(--font-family-sans);
```

### Font Loading

Add a new font file at `src/assets/fonts/plus-jakarta-sans.css`:

```css
/* Plus Jakarta Sans — locally bundled (variable weight 200–800) */

@font-face {
  font-family: "Plus Jakarta Sans";
  font-style: normal;
  font-weight: 200 800;
  font-display: swap;
  src: url("./PlusJakartaSans-VariableFont_wght.woff2") format("woff2"),
       url("./PlusJakartaSans-ExtraBold.woff2") format("woff2");
}

@font-face {
  font-family: "Plus Jakarta Sans";
  font-style: italic;
  font-weight: 200 800;
  font-display: swap;
  src: url("./PlusJakartaSans-Italic-VariableFont_wght.woff2") format("woff2");
}
```

Download from Google Fonts: https://fonts.google.com/specimen/Plus+Jakarta+Sans

### Typography Scale Adjustments

Replace heading styles in `src/index.css`:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-display);
  font-weight: 700;              /* Bolder than Yowza's 600 */
  letter-spacing: -0.03em;       /* Tighter tracking — Plus Jakarta Sans is wider */
  line-height: 1.15;
}

h1 {
  font-size: 2.25rem;            /* Slightly smaller than 2.5 — Plus Jakarta has larger x-height */
  font-weight: 800;
}

/* Brand heading — heavier weight, tighter tracking */
.brand-heading {
  font-family: var(--font-family-display);
  font-weight: 700;
  letter-spacing: -0.03em;
}

/* Brand body — wider line-height for readability */
.brand-body {
  font-family: var(--font-family-sans);
  font-weight: 500;              /* Medium weight — Plus Jakarta reads heavier at same weight */
  line-height: 1.55;
}
```

### Sidebar & UI Elements

The sidebar items already use `text-[13px]` which works well with Plus Jakarta Sans. The key difference is that Plus Jakarta Sans has a larger x-height and wider letterforms, so:

- Reduce sidebar item height from `h-8` to `h-7` (28px) for tighter packing
- Reduce button padding from default to `px-3 py-1.5` for compact feel
- Use `font-weight: 600` for active sidebar items instead of `font-medium`

---

## 3. LAYOUT & SPACING — Move from "Parchment" to "Glass Card"

The current Void design uses a parchment/warm neutral feel (`#f9f6f1` input backgrounds). This is a direct carryover from OpenWhispr's origin. Replace with a cooler, more technical "glass card" approach.

### Input Backgrounds

Replace the warm parchment input background:

```css
/* BEFORE (OpenWhispr parchment) */
--color-input: #f9f6f1;

/* AFTER (Void ocean glass) */
--color-input: #f0fdfa;  /* Teal 50 — subtle teal wash */
```

### Parchment Token Removal

Remove or replace all `--color-parchment-*` tokens:

```css
/* REMOVE these — they're OpenWhispr's identity */
--color-parchment-bg: #f9f6f1;
--color-parchment-border: #ddd4c7;
--color-parchment-text: #2b1f14;
--color-parchment-accent: #c0a77d;

/* REPLACE with Void's own brand tokens */
--color-brand-primary: #134e4a;       /* Teal 800 — deep brand */
--color-brand-accent: #0d9488;        /* Teal 600 — action brand */
--color-brand-highlight: #5eead4;     /* Teal 300 — accent highlight */
--color-brand-link: #0f766e;          /* Teal 700 — link state */
--color-pattern: #e0f2f1;             /* Teal 50 — pattern fills */
```

### Border Radius — Sharper, More Technical

The current radius is very tight (4-12px). Keep this — it works well and differentiates from Wispr Flow's softer 16px radius. But make the key surfaces slightly rounder:

```css
  /* Border Radius — sharp technical with key exceptions */
  --radius: 0.375rem;     /* 6px - buttons, inputs */
  --radius-sm: 0.25rem;   /* 4px - minimal */
  --radius-md: 0.375rem;  /* 6px - standard */
  --radius-lg: 0.5rem;    /* 8px - cards, panels */
  --radius-xl: 0.625rem;  /* 10px - large cards */
  --radius-shell: 0.875rem; /* 14px - main content container (was 12px, rounder for glass feel) */
```

### Card Depth System

Replace shadow tokens for a cleaner glass feel:

```css
/* Light mode glass cards */
--shadow-glass:
  inset 0 1px 0 rgba(255, 255, 255, 0.8),
  inset 0 0 0 1px rgba(255, 255, 255, 0.5),
  0 1px 3px rgba(13, 148, 136, 0.04);  /* Teal tinted shadow */

--shadow-brand-glass:
  inset 0 1px 0 rgba(255, 255, 255, 0.65),
  inset 0 0 0 1px rgba(255, 255, 255, 0.2),
  inset 0 -1px 1px rgba(0, 0, 0, 0.08);
```

### Sidebar Width

Reduce sidebar from `w-48` (192px) to `w-44` (176px) for a tighter, more focused feel:

```tsx
// ControlPanelSidebar.tsx — line 74
<div className="w-44 h-full shrink-0 flex flex-col bg-surface-window">
```

### Compact Window Sizing

If window dimensions are in `windowConfig.js`, consider reducing the dictation window from the current size to a smaller footprint. The floating pill should be slightly more compact — this is a key differentiation from Wispr Flow's larger overlay.

---

## 4. ICON REDESIGN — Abstract Teal V-Shape + Sound Waves

The current icon is a realistic microphone with waveform bars — visually identical to what Wispr Flow and OpenWhispr use. Replace with an **abstract letterform + sound waves**.

### New Icon Concept: "Void V"

A stylized letter "V" (for Void) that doubles as a sound wave visualization. The "V" is formed by two converging curved paths that also look like sound waves moving inward.

### SVG Design (512x512)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#042f2e"/>
      <stop offset="50%" stop-color="#134e4a"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>

    <linearGradient id="vGrad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#5eead4"/>
      <stop offset="40%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>

    <radialGradient id="centerGlow" cx="50%" cy="42%" r="50%">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#042f2e" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="waveL" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5eead4" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.6"/>
    </linearGradient>

    <linearGradient id="waveR" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#5eead4" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.6"/>
    </linearGradient>

    <clipPath id="squircle">
      <rect x="0" y="0" width="512" height="512" rx="108" ry="108"/>
    </clipPath>

    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <g clip-path="url(#squircle)">
    <rect width="512" height="512" fill="url(#bgGrad)"/>
    <rect width="512" height="512" fill="url(#centerGlow)"/>

    <!-- Ambient sound rings -->
    <circle cx="256" cy="230" r="140" fill="none" stroke="#14b8a6" stroke-width="1.5" opacity="0.08"/>
    <circle cx="256" cy="230" r="170" fill="none" stroke="#0d9488" stroke-width="1" opacity="0.05"/>

    <!-- Left sound waves (3 arcs) -->
    <g filter="url(#glow)">
      <path d="M148,180 Q100,260 148,340" fill="none" stroke="url(#waveL)"
            stroke-width="3" stroke-linecap="round" opacity="0.3"/>
      <path d="M120,170 Q60,260 120,350" fill="none" stroke="url(#waveL)"
            stroke-width="2.5" stroke-linecap="round" opacity="0.18"/>
      <path d="M95,160 Q25,260 95,360" fill="none" stroke="url(#waveL)"
            stroke-width="2" stroke-linecap="round" opacity="0.08"/>
    </g>

    <!-- Right sound waves (3 arcs) -->
    <g filter="url(#glow)">
      <path d="M364,180 Q412,260 364,340" fill="none" stroke="url(#waveR)"
            stroke-width="3" stroke-linecap="round" opacity="0.3"/>
      <path d="M392,170 Q452,260 392,350" fill="none" stroke="url(#waveR)"
            stroke-width="2.5" stroke-linecap="round" opacity="0.18"/>
      <path d="M417,160 Q487,260 417,360" fill="none" stroke="url(#waveR)"
            stroke-width="2" stroke-linecap="round" opacity="0.08"/>
    </g>

    <!-- The Void V — central lettermark -->
    <g filter="url(#glow)">
      <path d="M176,140 L256,350 L336,140"
            fill="none" stroke="url(#vGrad)" stroke-width="18"
            stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Inner V highlight (lighter, thinner) -->
    <path d="M196,160 L256,320 L316,160"
          fill="none" stroke="#5eead4" stroke-width="4"
          stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>

    <!-- Apex dot — the "void" point -->
    <circle cx="256" cy="350" r="6" fill="#5eead4" opacity="0.9"/>
    <circle cx="256" cy="350" r="12" fill="#14b8a6" opacity="0.15"/>
  </g>
</svg>
```

### Key Differences from Current Icon

| Feature | Current (Purple Mic) | New (Teal V) |
|---------|---------------------|--------------|
| Central symbol | Microphone | Abstract "V" lettermark |
| Color | Purple gradient `#7c3aed → #a78bfa` | Teal gradient `#0d9488 → #5eead4` |
| Background | Dark purple `#1a0f3c` | Deep teal `#042f2e` |
| Waves | Vertical bars (spectrum analyzer) | Curved arcs (sound waves) |
| Shape language | Realistic/skeuomorphic | Abstract/geometric |
| Glow | Purple glow | Teal glow |
| Differentiation | Identical to Wispr Flow | Unique — "V" is ownable |

### App Icon (Tray & Dock)

For the 16x16 and 22x22 tray icons, simplify to just the V shape on a teal rounded square — no waves, no detail. The lettermark scales better than the microphone.

### Horizontal Logo (void-header.svg)

Replace the current header with:

```svg
<!-- Simplified wordmark: V icon (left) + "VOID" text (right) -->
<!-- Same teal V mark, 48px, at left -->
<!-- "VOID" in Plus Jakarta Sans 800, tracking -0.04em -->
<!-- Tagline "VOICE DICTATION" in Plus Jakarta Sans 400, tracking 0.2em -->
```

---

## 5. OVERALL VISUAL IDENTITY — Three Pillars

### Pillar 1: "The Void" — Darkness as Identity

Lean into the name. The dark mode should feel like looking into a void — deep, infinite, with teal light emerging from darkness. This is the opposite of Wispr Flow's "forest" warmth.

**Dark mode surfaces should use:**
- Base: `oklch(0.16 0.012 175)` — deep navy-teal
- Card: `oklch(0.22 0.014 175)` — slightly lifted
- Borders: `oklch(0.28 0.015 175)` — teal-tinted

**Light mode surfaces should use:**
- Base: `#ffffff` — clean white
- Card: `#f8fffe` — barely-there teal wash
- Input: `#f0fdfa` — teal 50

### Pillar 2: "Teal Glass" — Premium Material

The glass effects (`.shadow-glass`, `.shadow-brand-glass`) should use teal-tinted shadows instead of neutral black. This is the subtle but persistent brand signal:

```css
/* Every shadow that touches a Void surface gets a teal tint */
.card {
  box-shadow: 0 1px 3px rgba(13, 148, 136, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.dark .card {
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.2),
              inset 0 1px 0 oklch(1 0 0 / 0.03);
}
```

### Pillar 3: "Precision Voice" — Technical, Not Playful

OpenWhispr and Wispr Flow both use soft, rounded, "friendly" design languages. Void should be the opposite: sharp, precise, technical. This means:

- **Keep tight border-radius** (4-10px) — don't soften to 16px+
- **Use heavier font weights** (700-800 headings, 500-600 body)
- **Tighter letter-spacing** (-0.03em on headings)
- **Crisper transitions** (150ms, not 200ms+)
- **Thinner borders** (1px, not 2px)
- **Less rounded corners on cards** — 8px max, not 16px

---

## Implementation Priority

### Phase 1: Immediate (Do First)
1. **Color palette swap** — `src/index.css` `@theme` + `.dark` blocks (30 min)
2. **Signal glow update** — `src/styles/dictation-panel.css` (10 min)
3. **Remove parchment tokens** — `src/index.css` (10 min)

### Phase 2: Brand Identity
4. **New icon SVG** — `src/assets/logo.svg` + `void-logo/void-icon-redesign.svg` (1 hour)
5. **Font loading** — Add Plus Jakarta Sans woff2 files, update `--font-family-sans` (30 min)
6. **Sidebar width reduction** — `ControlPanelSidebar.tsx` (5 min)

### Phase 3: Polish
7. **Accent bar gradient update** — `src/index.css` (10 min)
8. **Tilt card gradient update** — `src/index.css` (10 min)
9. **Onboarding brand tile** — Update gradient tokens in `src/index.css` (15 min)
10. **Onboarding compact hero** — Update gradient (5 min)

### Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Color palette, shadows, gradients, typography, parchment removal |
| `src/styles/dictation-panel.css` | Signal glow colors |
| `src/components/ControlPanelSidebar.tsx` | Sidebar width `w-48` → `w-44` |
| `src/assets/logo.svg` | New teal V icon |
| `void-logo/void-icon-redesign.svg` | New teal V icon (512px) |
| `void-logo/void-header.svg` | Updated horizontal logo |
| `src/assets/fonts/` | Add Plus Jakarta Sans woff2 files |

---

## Summary

The current Void design is visually entangled with OpenWhispr (identical origin) and Wispr Flow (same purple/teal family). The three changes that matter most:

1. **Purple → Teal** — Immediately signals "different product"
2. **Yowza → Plus Jakarta Sans** — Different typographic personality
3. **Microphone icon → V lettermark** — Ownable symbol, not a generic mic

Everything else (spacing, shadows, gradients) flows naturally from these three foundation changes. The goal is a product that looks like it was *designed*, not *rebranded*.
