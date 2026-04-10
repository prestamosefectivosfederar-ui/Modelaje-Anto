# Antonella Dimenza — Signature Edition Design Spec

**Date:** 2026-04-10  
**Scope:** Full-site visual overhaul — Editorial & Fotográfico tone  
**Level:** Signature (all layers)

---

## Overview

Transform the existing Antonella Dimenza portfolio into a high-impact editorial experience. The design philosophy centers on the photograph as the primary subject — every effect amplifies the imagery rather than competing with it. The aesthetic draws from analog fashion photography: film grain, cinematic reveals, and a portrait particle system that makes the model's presence tangible even in the abstract.

---

## 1. Global — Film Grain Overlay

**What it does:** A fixed `<canvas>` element layered over the entire page that continuously regenerates animated noise, simulating analog film grain.

**Implementation:**
- Canvas: `position: fixed`, `inset: 0`, `pointer-events: none`, `z-index: 9999`
- Each frame (every 2 RAF ticks): fill canvas with random pixel values in a grayscale range, blended with `screen` mix-blend-mode
- Opacity: 4–6% — perceptible on whites, invisible on blacks
- Performance: use a small offscreen canvas (e.g. 256×256) tiled across the viewport to reduce pixel fill cost

**Affected files:** `main.js` (new `initFilmGrain()` method), `style.css` (canvas positioning)

---

## 2. Global — Cursor: Photographic Viewfinder

**What it does:** Replaces the current simple `.cursor` circle with a photographic viewfinder aesthetic.

**Implementation:**
- Default state: circle (40px) with four short tick marks at N/S/E/W — like a camera focus point
- Hover over `<img>`, `.gallery-item`, `.media-box`: cursor morphs to a lens aperture shape (filled circle shrinks, outer ring grows), shows a subtle zoom icon
- Magnetic pull: on hover, cursor snaps slightly toward the center of the hovered element (GSAP lerp)
- Transition: all morphs animated at 0.15s ease

**Affected files:** `main.js` (`initInteractive()` extended), `style.css` (cursor variants)

---

## 3. Hero — Parallax Profundo + Kinetic Text

**What it does:** Deepens the existing hero entry and makes the typography feel alive.

**Implementation:**
- `#hero-portrait` opacity: raised from `0.3` → `0.65` on load; GSAP parallax from `scale(1.15)` to `scale(1.0)` as user scrolls past hero
- SVG text: split "ANTONELLA" and "DIMENZA" into individual `<tspan>` or replaced with per-letter `<text>` elements; GSAP stagger entrance (delay 0.06s per letter, fromTo y:40→0, opacity:0→1)
- Mouse move: subtle horizontal shift of text layer opposite to cursor direction (max ±12px), creating a depth illusion
- Scroll out: hero content fades and scales down gently as the next section enters

**Affected files:** `index.html` (SVG text structure), `main.js` (`animateHero()` rewrite), `style.css`

---

## 4. Gallery — Clip-path Reveal + Hover Grain + Lightbox

**What it does:** Replaces basic fade-up reveals with cinematic wipe-ins; adds hover interactivity and a full lightbox.

**Implementation:**

**Clip-path reveal:**
- Each `.gallery-item` animates from `clip-path: inset(100% 0 0 0)` → `inset(0% 0 0 0)` on scroll enter
- Duration: 1.2s, ease: `expo.out`; staggered if multiple items enter at once

**Hover grain:**
- On `.gallery-item:hover`: a grain canvas overlay (same technique as global grain but denser, 12–15% opacity) fades in over the image
- Simultaneously: image scales to 1.06 (subtle zoom)

**Lightbox:**
- Click on any `.gallery-item`: full-screen overlay with `background: #000`
- Image centered, max 90vw × 90vh, fade in at 0.4s
- Close: click outside or press Escape
- No external library — pure JS + CSS

**Affected files:** `main.js` (new `initGallery()` method), `style.css`, `index.html` (add lightbox container)

---

## 5. About Section — Portrait Particle Canvas

**What it does:** Activates the currently empty `#about-canvas` with a particle system that samples a portrait image and forms the model's face from dispersed particles.

**Implementation:**

**Particle sampling:**
- Load a portrait image (e.g. `about_model.jpeg`) into an offscreen canvas
- Sample pixels at a grid (step: ~4px), keep only pixels with luminance > threshold (40)
- Store sampled positions as particle targets (normalized 0–1 coordinates)

**Particle states:**
- **Idle** (before viewport): particles drift in slow organic flow using sin/cos pseudo-noise offsets (no external noise library)
- **Forming** (on scroll enter): each particle springs to its target face position — GSAP `stagger` with spring ease (`back.out(1.2)`, duration 1.8s)
- **Hover** (mouse over `.about-media-staggered`): particles explode outward and then re-form

**Render loop:**
- Pure Canvas 2D (no Three.js — keep it lightweight)
- Particle: 1.5px radius, white, opacity driven by proximity to target
- Canvas sized to fill `#about-canvas` bounding rect, responsive on resize

**Performance:** cap at 6000 particles; debounce resize

**Affected files:** `main.js` (new `initAboutCanvas()` method), `style.css` (`#about-canvas` positioning)

---

## 6. Stats Section — Orbital Particles

**What it does:** Upgrades the current static rotating point cloud to orbit the portrait.

**Implementation:**
- Existing Three.js setup retained; points reorganized into two elliptical orbital rings around the Y-axis
- Ring 1 (inner): 300 particles, tight orbit, faster rotation
- Ring 2 (outer): 500 particles, wider orbit, slower rotation, slight tilt
- On scroll into view: rings fade in with particles spiraling inward from outside

**Affected files:** `main.js` (`tryInitStatsParticles()` rewrite)

---

## 7. Marquee — Variable Scroll Speed

**What it does:** The `.marquee` clients ticker accelerates when the user scrolls fast and decelerates to normal when idle.

**Implementation:**
- Track scroll velocity via Lenis `on('scroll')` event delta
- Map velocity → CSS `animation-duration` (range: 8s fast → 30s slow) with lerp smoothing
- Direction: scrolling down speeds up marquee, scrolling up reverses it slightly

**Affected files:** `main.js` (new `initMarquee()` method), `style.css` (remove hardcoded animation duration)

---

## Architecture

All new functionality added as methods to the existing `AntonellaApp` class. No new files beyond this spec — all changes in `main.js`, `style.css`, and minor markup in `index.html`.

**Load order:**
1. `initFilmGrain()` — called immediately (no dependencies)
2. `initAboutCanvas()` — called after DOM ready, image loaded async
3. `initGallery()` — called in `initGSAP()` block
4. `initMarquee()` — called in `tryInitLenis()` block
5. Hero + cursor: existing methods extended

---

## Out of Scope

- WebGL distortion on hero image (deferred — would require shader setup)
- Mobile-specific particle fallbacks (particles hidden on `prefers-reduced-motion`)
- Sound effects / audio reactivity
