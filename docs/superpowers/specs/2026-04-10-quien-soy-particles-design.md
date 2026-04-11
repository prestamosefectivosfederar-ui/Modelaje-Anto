# QUIEN SOY — Canvas Particle Flow Field Effect

**Date:** 2026-04-10  
**Status:** Approved

## Overview

Add a WebGL-style Canvas 2D particle flow field to the `.about-stitch` section (QUIEN SOY). A `<canvas>` element sits as an absolute-positioned background behind all existing HTML content. ~800 particles move through a Perlin-noise flow field, leaving glowing trails, and are repelled by the mouse cursor within a ~150px radius.

## Visual Design

- **Background canvas**: `position: absolute`, `top: 0`, `left: 0`, `100% × 100%` of `.about-stitch`, `z-index: 0`
- **Existing content**: wrapped in a relative `z-index: 1` container so it renders above the canvas
- **Particle color**: white-cold range (`rgba(180–220, 200–230, 255, 0.4–0.8)`)
- **Trail effect**: canvas cleared each frame with `fillRect rgba(0,0,0,0.05)` — creates glowing tails
- **Blend mode**: `globalCompositeOperation = 'screen'` — colors add up and glow on black

## Particle System

| Property | Value |
|---|---|
| Count | 800 |
| Speed base | 0.5–1.5 px/frame |
| Life / reset | Particle resets to random position when it exits bounds |
| Flow field resolution | 20px grid cells |
| Flow field noise | Simple 2D hash-based pseudo-Perlin (no library) |
| Flow field update | Every 120 frames (slow drift) |

## Mouse Interaction

- `mousemove` tracked on the `.about-stitch` element (relative coords)
- Per frame, for each particle within radius 150px:  
  `force = (1 - distance/150) * 3.0`  
  Push direction: radially away from mouse
- Outside radius: flow field resumes control with no transition needed (force = 0)

## Performance

- `IntersectionObserver` starts/stops `requestAnimationFrame` loop when section enters/exits viewport
- `resize` handler with 200ms debounce resets canvas size and re-generates flow field grid
- Canvas uses `will-change: transform` and `pointer-events: none`

## Files Changed

| File | Change |
|---|---|
| `index.html` | Add `<canvas id="about-canvas">` as first child of `.about-stitch`; wrap grid content in `<div class="about-content-layer">` |
| `style.css` | Position canvas absolutely; add `.about-content-layer` with `position: relative; z-index: 1` |
| `main.js` | Add `initAboutCanvas()` method to `AntonellaApp`; call from constructor |

## Out of Scope

- No Three.js or external canvas libraries
- No change to existing GSAP scroll animations
- No mobile touch interaction (canvas still renders, mouse effects simply don't trigger)
