# Void App Icon — Design Brief

## Overview

The Void icon is a custom 'V' lettermark with integrated sound wave elements, designed to convey the app's core identity: voice-to-text dictation. The icon deliberately avoids the overused microphone motif in favor of an abstract, memorable mark that scales cleanly from 32×32 tray icons to 256×256 app icons.

## Concept

### The Lettermark

The central element is a bold, geometric uppercase **V** rendered in Ocean Teal (#0d9488). The V has slightly rounded stroke joins for approachability, with thick arms that taper naturally toward the apex. The two arms of the V diverge from a single bottom point — symbolizing the act of speaking outward from a single source.

### Sound Waves

Three to four concentric arc segments emanate outward from the V's interior, positioned on both the left and right sides. These arcs suggest:

- **Audio output** — sound propagating from the V (the voice)
- **Ripple effect** — the app captures and transforms speech in real time
- **Radiance** — a subtle visual metaphor for clarity and precision

The waves are rendered with decreasing opacity (from inner to outer), creating a natural falloff that mimics real acoustic propagation.

### Background

A dark rounded-square background (#121224) provides strong contrast for the teal mark. A soft radial glow behind the V adds depth and makes the icon pop on both light and dark desktop environments.

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary (V + waves) | Ocean Teal | `#0d9488` |
| Accent / gradient top | Teal Light | `#14b8a6` |
| Background | Dark Navy | `#121224` |
| Glow | Teal (low alpha) | `#0d9488 @ 15%` |

## Design Principles

1. **Legibility at small sizes** — The V shape reads clearly at 32×32; wave details are decorative, not structural
2. **No microphone** — Avoids the generic voice-app cliché; the V lettermark is the brand
3. **Geometric simplicity** — Clean shapes render well across pixel densities (1× through 3× Retina)
4. **Dark-mode native** — The dark background ensures the icon works on any OS taskbar or dock
5. **Platform-neutral** — No platform-specific affordances; works on macOS, Windows, and Linux

## File Inventory

| File | Size | Purpose |
|------|------|---------|
| `src/assets/icon.png` | 256×256 | Primary app icon (Electron `icon` field) |
| `src/assets/icon-64.png` | 64×64 | Taskbar / dock representation |
| `src/assets/icon-32.png` | 32×32 | System tray icon |
| `void-logo/void-icon.png` | 256×256 | Marketing / documentation copy |
| `void-logo/void-icon-64.png` | 64×64 | Marketing / documentation copy |
| `void-logo/void-icon-32.png` | 32×32 | Marketing / documentation copy |

All files are RGBA PNG with transparent backgrounds (the rounded-square background is baked in).

## Generation Method

Icons were generated programmatically using Python + Pillow with 4× supersampling for anti-aliasing, then downsampled with Lanczos resampling. This ensures:

- Pixel-perfect geometry at every target size
- Consistent rendering across all output sizes
- No dependency on external image generation services
- Full reproducibility (see `void-logo/generate_icon.py`)

## Scaling Notes

The icon uses a "supersample-then-resize" pipeline: all geometry is computed at 4× the target resolution, then downsampled with Lanczos interpolation. This produces clean anti-aliased edges without the artifacts of direct at-target rendering.

For future sizes (e.g., 192×192 for web manifest, 512×512 for macOS DMG), simply adjust the `size` parameter in `generate_icon.py`.

## Usage in Electron

In `electron-builder.json`, the icon field should reference `src/assets/icon.png` (256×256). For macOS `.icns` generation, the build pipeline will scale from this source. For Windows `.ico`, multiple sizes should be bundled — `icon.png` (256), `icon-64.png` (64), and `icon-32.png` (32) cover the standard Windows icon sizes.

```json
{
  "build": {
    "icon": "src/assets/icon.png"
  }
}
```

## Future Considerations

- **Animated icon** — A subtle pulse animation on the sound waves could be added for the in-app recording state indicator
- **Light background variant** — A version with a white/light gray background for contexts where dark icons don't work
- **Monochrome variant** — A single-color version for watermarks and favicons
