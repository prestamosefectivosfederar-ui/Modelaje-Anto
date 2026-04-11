# QUIEN SOY Particle Flow Field — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Canvas 2D particle flow field with mouse repulsion as the animated background of the `.about-stitch` (QUIEN SOY) section.

**Architecture:** A `<canvas id="about-canvas">` is positioned absolutely behind all existing HTML content. An `initAboutCanvas()` method on `AntonellaApp` owns a `Particle` class, a smooth-noise flow field, a `requestAnimationFrame` loop, and mouse + IntersectionObserver event wiring. The canvas fills the full section and glows via `globalCompositeOperation: 'screen'`.

**Tech Stack:** Vanilla JS Canvas 2D API, GSAP (already loaded), Lenis (already loaded). No new dependencies.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Add `<canvas id="about-canvas">` as first child of `.about-stitch`; wrap all existing children in `<div class="about-content-layer">` |
| `style.css` | Add `position: relative` to `.about-stitch`; add `#about-canvas` absolute positioning; add `.about-content-layer` z-index layer |
| `main.js` | Add `Particle` class above `AntonellaApp`; add `initAboutCanvas()` method; call it from constructor |

---

## Task 1: HTML — Add canvas and content wrapper

**Files:**
- Modify: `index.html:64-96` (`.about-stitch` section)

- [ ] **Step 1: Add `<canvas>` and wrap existing children**

Replace the opening `<section class="about-stitch">` block so it reads:

```html
<section class="about-stitch">
    <canvas id="about-canvas"></canvas>
    <div class="about-content-layer">
        <div class="about-header-main">
            <h2 class="ultra-title reveal">QUIEN</h2>
            <h2 class="ultra-title outline hide-mobile reveal">SOY?</h2>
        </div>
        
        <div class="about-grid-layout">
            <div class="about-media-staggered">
                <div class="media-box pos-1 reveal"><img src="ab1.png" alt="Profile"></div>
                <div class="media-box pos-2 reveal"><img src="ab2.png" alt="Dynamic"></div>
                <div class="media-box pos-3 reveal"><img src="ab3.png" alt="Artistic"></div>
            </div>

            <div class="about-text-content">
                <div class="about-info-block reveal">
                    <span class="info-num">01.</span>
                    <h3>Misión & Filosofía</h3>
                    <p>Antonella Dimenza encarna la intersección entre la estética clásica y la provocación moderna. Cada campaña es una exploración de la forma, la luz y la identidad.</p>
                </div>
                <div class="about-info-block reveal">
                    <span class="info-num">02.</span>
                    <h3>Trayectoria Global</h3>
                    <p>Con base en Milán y presencia en las principales pasarelas de París y Nueva York, Antonella colabora con directores creativos para elevar narrativas visuales.</p>
                </div>
                <a href="#" class="btn-archive reveal">Ver Archivo / 2026</a>
            </div>
        </div>

        <div class="about-footer-meta">
            <div class="meta-item">45.4642° N, 9.1900° E</div>
            <div class="meta-item">EDITORIAL / MILAN / SS26</div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Verify in browser**

Open `index.html`. The QUIEN SOY section should look identical to before (canvas is invisible with no JS yet). DevTools Elements tab should show `#about-canvas` as first child of `.about-stitch`.

---

## Task 2: CSS — Position canvas and layer content

**Files:**
- Modify: `style.css` — update `.about-stitch`, add `#about-canvas` and `.about-content-layer`

- [ ] **Step 1: Add `position: relative` to `.about-stitch`**

Find the existing `.about-stitch` rule and add `position: relative`:

```css
.about-stitch {
  min-height: 150vh;
  padding: 150px 60px;
  background: #000;
  display: flex;
  flex-direction: column;
  gap: 80px;
  position: relative;
}
```

- [ ] **Step 2: Add canvas and content layer rules**

Append after the `.about-stitch` rule:

```css
#about-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  will-change: transform;
  z-index: 0;
}

.about-content-layer {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 80px;
  width: 100%;
}
```

- [ ] **Step 3: Verify layout**

Open `index.html`. The QUIEN SOY section must still look exactly the same — photos, text, buttons all visible, no overlap issues. Canvas covers the background.

---

## Task 3: JS — Particle class

**Files:**
- Modify: `main.js` — add `Particle` class above `class AntonellaApp`

- [ ] **Step 1: Add the `Particle` class**

Insert this block at line 1 of `main.js`, before `class AntonellaApp`:

```javascript
class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.cw = canvasWidth;
        this.ch = canvasHeight;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.cw;
        this.y = Math.random() * this.ch;
        this.vx = 0;
        this.vy = 0;
        this.speed = 0.5 + Math.random() * 1.0;
        const alpha = 0.4 + Math.random() * 0.4;
        const rg = 150 + Math.floor(Math.random() * 70);
        const b = 200 + Math.floor(Math.random() * 55);
        this.color = `rgba(${rg},${rg + 20},${b},${alpha})`;
    }

    update(flowAngle, mouseX, mouseY) {
        // Flow field nudge
        this.vx += Math.cos(flowAngle) * 0.05;
        this.vy += Math.sin(flowAngle) * 0.05;

        // Mouse repulsion
        if (mouseX !== null) {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distSq = dx * dx + dy * dy;
            const radius = 150;
            if (distSq < radius * radius && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const force = (1 - dist / radius) * 3.0;
                this.vx += (dx / dist) * force * 0.1;
                this.vy += (dy / dist) * force * 0.1;
            }
        }

        // Damping
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;

        // Wrap / reset when out of bounds
        if (this.x < -5 || this.x > this.cw + 5 || this.y < -5 || this.y > this.ch + 5) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

- [ ] **Step 2: Verify no JS errors**

Open browser DevTools Console. Reload page. There should be no errors. The class is defined but not yet used.

---

## Task 4: JS — `initAboutCanvas()` method

**Files:**
- Modify: `main.js` — add method to `AntonellaApp`, call from constructor

- [ ] **Step 1: Add `initAboutCanvas()` to `AntonellaApp`**

Add this method inside `AntonellaApp`, after the `initInteractive()` method (before the closing `}`):

```javascript
    initAboutCanvas() {
        const section = document.querySelector('.about-stitch');
        const canvas = document.getElementById('about-canvas');
        if (!canvas || !section) return;

        const ctx = canvas.getContext('2d');
        const PARTICLE_COUNT = 800;
        const CELL_SIZE = 20;

        let particles = [];
        let flowField = [];
        let mouseX = null;
        let mouseY = null;
        let rafId = null;
        let frameCount = 0;
        let cols = 0;
        let rows = 0;

        const buildFlowField = () => {
            const t = frameCount * 0.001;
            flowField = [];
            for (let r = 0; r < rows; r++) {
                flowField[r] = [];
                for (let c = 0; c < cols; c++) {
                    flowField[r][c] =
                        Math.sin(c * 0.1 + t) *
                        Math.cos(r * 0.1 + t * 0.7) *
                        Math.PI * 4;
                }
            }
        };

        const resize = () => {
            canvas.width = section.offsetWidth;
            canvas.height = section.offsetHeight;
            cols = Math.ceil(canvas.width / CELL_SIZE);
            rows = Math.ceil(canvas.height / CELL_SIZE);
            buildFlowField();
            particles = Array.from(
                { length: PARTICLE_COUNT },
                () => new Particle(canvas.width, canvas.height)
            );
        };

        const loop = () => {
            rafId = requestAnimationFrame(loop);
            frameCount++;

            if (frameCount % 120 === 0) buildFlowField();

            // Trail: semi-transparent fill instead of clearRect
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Additive blending for glow
            ctx.globalCompositeOperation = 'screen';

            particles.forEach(p => {
                const col = Math.min(Math.floor(p.x / CELL_SIZE), cols - 1);
                const row = Math.min(Math.floor(p.y / CELL_SIZE), rows - 1);
                const angle = (flowField[row] && flowField[row][col] !== undefined)
                    ? flowField[row][col]
                    : 0;
                p.update(angle, mouseX, mouseY);
                p.draw(ctx);
            });
        };

        // Mouse coords relative to canvas top-left
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        section.addEventListener('mouseleave', () => {
            mouseX = null;
            mouseY = null;
        });

        // Debounced resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });

        // Start/stop loop with visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!rafId) loop();
                } else {
                    if (rafId) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                }
            });
        }, { threshold: 0.05 });

        observer.observe(section);

        resize();
    }
```

- [ ] **Step 2: Call `initAboutCanvas()` from the constructor**

Find the constructor in `AntonellaApp`:

```javascript
    constructor() {
        this.initLenis();
        this.initLoader();
        this.initGSAP();
        this.initInteractive();
    }
```

Add the call:

```javascript
    constructor() {
        this.initLenis();
        this.initLoader();
        this.initGSAP();
        this.initInteractive();
        this.initAboutCanvas();
    }
```

- [ ] **Step 3: Verify particle system renders**

Reload the page. Scroll to QUIEN SOY. You should see:
- Glowing white-blue particles flowing organically across the dark background
- Particles leave a fading luminous trail
- Moving the mouse over the section pushes particles away in a radial burst
- Removing the mouse from the section, particles return to flow-field movement
- DevTools Console: zero errors

- [ ] **Step 4: Verify performance**

Open DevTools Performance tab. Record 5 seconds on the QUIEN SOY section. The frame rate should stay at or near 60fps. If it drops below 30fps consistently, reduce `PARTICLE_COUNT` from `800` to `500` in `initAboutCanvas()`.

- [ ] **Step 5: Verify IntersectionObserver pause**

With DevTools Performance tab recording, scroll AWAY from the QUIEN SOY section completely. The RAF loop should stop (no canvas paint calls visible). Scroll back — it resumes.

---

## Task 5: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add index.html style.css main.js
git commit -m "feat: add canvas particle flow field to QUIEN SOY section

800-particle flow field with smooth-noise guidance and mouse repulsion.
Uses Canvas 2D screen blending for glow effect. IntersectionObserver
pauses loop when section is offscreen."
```
