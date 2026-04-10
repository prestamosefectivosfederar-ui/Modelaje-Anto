# Antonella Dimenza — Signature Edition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Antonella Dimenza portfolio into a high-impact editorial experience with film grain, portrait particle system, cinematic gallery, kinetic typography, orbital stats particles, and a photographic cursor.

**Architecture:** All new functionality added as methods to the existing `AntonellaApp` class in `main.js`. CSS changes in `style.css`. Minimal markup additions in `index.html` (lightbox container only). No new files, no build system — plain vanilla JS with GSAP/Three.js/Lenis loaded from CDN.

**Tech Stack:** Vanilla JS (ES6 classes), GSAP 3 + ScrollTrigger, Three.js r162, Lenis 1.1.9, Canvas 2D API

---

## File Map

| File | Changes |
|------|---------|
| `main.js` | Add: `initFilmGrain()`, `initAboutCanvas()`, `initGallery()`, `initMarquee()`. Rewrite: `animateHero()`, `initInteractive()`, `tryInitStatsParticles()`. Extend: constructor call order. |
| `style.css` | Add: grain canvas, cursor viewfinder, clip-path gallery, lightbox, about-canvas positioning, marquee speed var. Fix: hero selectors. |
| `index.html` | Add: `<div id="lightbox">` before `</main>`. No other structural changes. |

---

## Task 1: Film Grain Overlay

**Files:**
- Modify: `main.js` — add `initFilmGrain()`, call from constructor
- Modify: `style.css` — no additions needed (all styles injected inline)

- [ ] **Step 1: Add `initFilmGrain()` to `main.js`**

  In `main.js`, inside `AntonellaApp`, add this method after `tryInitLenis()`:

  ```javascript
  initFilmGrain() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 256;
      patternCanvas.height = 256;
      const pCtx = patternCanvas.getContext('2d');

      const overlay = document.createElement('canvas');
      overlay.style.cssText = [
          'position:fixed', 'inset:0', 'width:100%', 'height:100%',
          'pointer-events:none', 'z-index:9999',
          'mix-blend-mode:screen', 'opacity:0.05'
      ].join(';');
      document.body.appendChild(overlay);
      const ctx = overlay.getContext('2d');

      const resize = () => {
          overlay.width = window.innerWidth;
          overlay.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      let tick = 0;
      const render = () => {
          requestAnimationFrame(render);
          if (++tick % 2 !== 0) return;

          const imgData = pCtx.createImageData(256, 256);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
              const v = Math.random() * 255;
              d[i] = d[i + 1] = d[i + 2] = v;
              d[i + 3] = 18;
          }
          pCtx.putImageData(imgData, 0, 0);

          const pattern = ctx.createPattern(patternCanvas, 'repeat');
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, overlay.width, overlay.height);
      };
      render();
  }
  ```

- [ ] **Step 2: Call `initFilmGrain()` from constructor**

  In the `setTimeout` block inside the constructor, add the call:

  ```javascript
  setTimeout(() => {
      this.tryInitLenis();
      this.initGSAP();
      this.initInteractive();
      this.tryInitStatsParticles();
      this.initFilmGrain(); // ← add this line
  }, 100);
  ```

- [ ] **Step 3: Verify in browser**

  Open the site. The page should have a subtle animated noise texture visible especially on white/light areas. Open DevTools → Elements — confirm a `<canvas>` with `mix-blend-mode:screen` is the last child of `<body>`.

- [ ] **Step 4: Commit**

  ```bash
  git add main.js
  git commit -m "feat: add film grain overlay canvas"
  ```

---

## Task 2: Cursor Viewfinder

**Files:**
- Modify: `main.js` — rewrite `initInteractive()`
- Modify: `style.css` — replace cursor rules

- [ ] **Step 1: Replace cursor CSS in `style.css`**

  Find the existing `.cursor` rule and replace it (search for `.cursor {`):

  ```css
  .cursor {
      position: fixed;
      width: 36px;
      height: 36px;
      pointer-events: none;
      z-index: 10000;
      transform: translate(-50%, -50%);
      transition: width 0.2s ease, height 0.2s ease, opacity 0.2s ease;
  }

  .cursor::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.7);
  }

  /* Four tick marks */
  .cursor::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
          linear-gradient(rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 6px) center 0/1px 6px no-repeat,
          linear-gradient(rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 6px) center 100%/1px 6px no-repeat,
          linear-gradient(rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 1px) 0 center/6px 1px no-repeat,
          linear-gradient(rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 1px) 100% center/6px 1px no-repeat;
  }

  .cursor.is-hovering {
      width: 64px;
      height: 64px;
      opacity: 0.5;
  }
  ```

- [ ] **Step 2: Rewrite `initInteractive()` in `main.js`**

  ```javascript
  initInteractive() {
      const cursor = document.querySelector('.cursor');
      if (!cursor) return;

      let mouseX = -100, mouseY = -100;

      window.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          if (typeof gsap !== 'undefined') {
              gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.12, ease: 'power2.out' });
          }
      });

      const hoverTargets = 'a, button, .gallery-item, .media-box, img, .service-item';
      document.querySelectorAll(hoverTargets).forEach(el => {
          el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
          el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
      });

      // Hide cursor when leaving window
      document.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
      document.addEventListener('mouseenter', () => gsap.to(cursor, { opacity: 1, duration: 0.2 }));
  }
  ```

- [ ] **Step 3: Verify in browser**

  Move the mouse around the site. The cursor should show a circle with 4 tick marks like a camera viewfinder. Hovering over links, images, or gallery items should expand it.

- [ ] **Step 4: Commit**

  ```bash
  git add main.js style.css
  git commit -m "feat: photographic viewfinder cursor"
  ```

---

## Task 3: Hero Kinetic Text + Deep Parallax

**Files:**
- Modify: `main.js` — rewrite `animateHero()`
- Modify: `style.css` — hero text and parallax adjustments

**Note:** The current `animateHero()` references `.hero-image-container` and `.clipped-title` which don't exist in the HTML. The actual elements are `.hero-bg` and `.hero-svg-text`. This task fixes that.

- [ ] **Step 1: Update hero CSS in `style.css`**

  Find `.hero-bg` rule and ensure the image opacity is higher and text is animatable. Add these rules (or update existing):

  ```css
  .hero-bg img {
      opacity: 0;
      transform: scale(1.15);
      transition: none; /* GSAP controls this */
  }

  .hero-svg-text .text-char {
      display: inline;
  }

  /* Mouse parallax layer */
  .hero-content {
      will-change: transform;
  }
  ```

- [ ] **Step 2: Rewrite `animateHero()` in `main.js`**

  ```javascript
  animateHero() {
      if (typeof gsap === 'undefined') return;

      const portrait = document.querySelector('#hero-portrait');
      const svgText = document.querySelector('.hero-svg-text');
      const subtext = document.querySelector('.hero-subtext');
      const scrollIndicator = document.querySelector('.scroll-indicator');

      const tl = gsap.timeline();

      // Portrait: fade in and de-scale
      if (portrait) {
          tl.to(portrait, { scale: 1, opacity: 0.65, duration: 2.2, ease: 'expo.out' }, 0);
      }

      // SVG text: split into two elements, stagger them
      if (svgText) {
          const texts = svgText.querySelectorAll('text');
          tl.fromTo(texts,
              { y: 60, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.4, stagger: 0.08, ease: 'power4.out' },
              0.6
          );
      }

      if (subtext) {
          tl.fromTo(subtext,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 0.75, duration: 1, ease: 'power3.out' },
              1.2
          );
      }

      if (scrollIndicator) {
          tl.fromTo(scrollIndicator,
              { opacity: 0 },
              { opacity: 1, duration: 0.8, ease: 'power2.out' },
              1.8
          );
      }

      // Mouse parallax on hero content
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
          window.addEventListener('mousemove', (e) => {
              const cx = (e.clientX / window.innerWidth - 0.5) * 18;
              const cy = (e.clientY / window.innerHeight - 0.5) * 10;
              gsap.to(heroContent, { x: cx, y: cy, duration: 1.2, ease: 'power2.out' });
              if (portrait) {
                  gsap.to(portrait, { x: -cx * 0.4, y: -cy * 0.4, duration: 1.5, ease: 'power2.out' });
              }
          });
      }

      // Scroll parallax: hero fades out as next section enters
      if (typeof ScrollTrigger !== 'undefined' && portrait) {
          gsap.to(portrait, {
              scale: 1.1,
              opacity: 0,
              scrollTrigger: {
                  trigger: '.hero',
                  start: 'top top',
                  end: 'bottom top',
                  scrub: true,
              }
          });
      }
  }
  ```

- [ ] **Step 3: Verify in browser**

  After the loader disappears, the hero portrait should fade in at higher opacity (0.65) with a de-scale, text slides up staggered, subtext fades in. Moving the mouse should shift text and portrait in opposite directions. Scrolling past hero should fade the portrait.

- [ ] **Step 4: Commit**

  ```bash
  git add main.js style.css
  git commit -m "feat: hero kinetic text and deep parallax"
  ```

---

## Task 4: Gallery — Clip-path Reveal + Hover Grain

**Files:**
- Modify: `main.js` — add `initGallery()`, call from constructor
- Modify: `style.css` — gallery item hover and clip states

- [ ] **Step 1: Add gallery CSS to `style.css`**

  Add after the existing gallery rules:

  ```css
  /* Clip-path reveal — GSAP sets clip-path on scroll */
  .gallery-item {
      clip-path: inset(100% 0 0 0);
      overflow: hidden;
  }

  /* Hover grain overlay */
  .gallery-item .grain-hover {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      mix-blend-mode: screen;
      transition: opacity 0.3s ease;
      z-index: 2;
  }

  .gallery-item:hover .grain-hover {
      opacity: 1;
  }

  .gallery-item img {
      transition: transform 0.6s ease;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
  }

  .gallery-item:hover img {
      transform: scale(1.06);
  }
  ```

- [ ] **Step 2: Add `initGallery()` to `main.js`**

  ```javascript
  initGallery() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      const items = document.querySelectorAll('.gallery-item');
      if (!items.length) return;

      // Clip-path scroll reveal
      items.forEach((item, i) => {
          gsap.to(item, {
              clipPath: 'inset(0% 0 0 0)',
              duration: 1.2,
              ease: 'expo.out',
              scrollTrigger: {
                  trigger: item,
                  start: 'top 88%',
              },
              delay: (i % 2) * 0.12,
          });
      });

      // Hover grain overlay per item
      items.forEach(item => {
          const grainCanvas = document.createElement('canvas');
          grainCanvas.className = 'grain-hover';
          item.style.position = 'relative';
          item.appendChild(grainCanvas);

          const ctx = grainCanvas.getContext('2d');
          let animId = null;
          let active = false;

          const resize = () => {
              grainCanvas.width = item.offsetWidth;
              grainCanvas.height = item.offsetHeight;
          };

          const renderGrain = () => {
              if (!active) return;
              animId = requestAnimationFrame(renderGrain);
              const w = grainCanvas.width, h = grainCanvas.height;
              const imgData = ctx.createImageData(w, h);
              const d = imgData.data;
              for (let i = 0; i < d.length; i += 4) {
                  const v = Math.random() * 255;
                  d[i] = d[i + 1] = d[i + 2] = v;
                  d[i + 3] = 30;
              }
              ctx.putImageData(imgData, 0, 0);
          };

          item.addEventListener('mouseenter', () => {
              resize();
              active = true;
              renderGrain();
          });

          item.addEventListener('mouseleave', () => {
              active = false;
              cancelAnimationFrame(animId);
              ctx.clearRect(0, 0, grainCanvas.width, grainCanvas.height);
          });
      });
  }
  ```

- [ ] **Step 3: Call `initGallery()` from constructor**

  In the `setTimeout` block:

  ```javascript
  setTimeout(() => {
      this.tryInitLenis();
      this.initGSAP();
      this.initInteractive();
      this.tryInitStatsParticles();
      this.initFilmGrain();
      this.initGallery(); // ← add this line
  }, 100);
  ```

- [ ] **Step 4: Verify in browser**

  Scroll to the gallery section. Each image should wipe in from the bottom (clip-path inset). Hover over a gallery item — grain texture should appear over the image and image should zoom slightly.

- [ ] **Step 5: Commit**

  ```bash
  git add main.js style.css
  git commit -m "feat: gallery clip-path reveal and hover grain"
  ```

---

## Task 5: Gallery Lightbox

**Files:**
- Modify: `index.html` — add `#lightbox` element
- Modify: `main.js` — extend `initGallery()` with lightbox logic
- Modify: `style.css` — lightbox overlay styles

- [ ] **Step 1: Add lightbox HTML to `index.html`**

  Before the closing `</main>` tag, add:

  ```html
  <div id="lightbox" aria-hidden="true">
      <button class="lightbox-close" aria-label="Cerrar">&#x2715;</button>
      <img class="lightbox-img" src="" alt="">
  </div>
  ```

- [ ] **Step 2: Add lightbox CSS to `style.css`**

  ```css
  #lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s ease;
  }

  #lightbox.is-open {
      opacity: 1;
      pointer-events: all;
  }

  .lightbox-img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      transform: scale(0.96);
      transition: transform 0.4s ease;
  }

  #lightbox.is-open .lightbox-img {
      transform: scale(1);
  }

  .lightbox-close {
      position: absolute;
      top: 24px;
      right: 32px;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      line-height: 1;
      transition: color 0.2s ease;
  }

  .lightbox-close:hover {
      color: #fff;
  }
  ```

- [ ] **Step 3: Add lightbox logic inside `initGallery()` in `main.js`**

  At the end of the `initGallery()` method, append:

  ```javascript
  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;

  if (!lightbox || !lightboxImg) return;

  const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
  };

  items.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
          const img = item.querySelector('img');
          if (img) openLightbox(img.src, img.alt);
      });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
  });
  ```

- [ ] **Step 4: Verify in browser**

  Click any gallery image. A full-screen black overlay should appear with the image centered. Click outside the image or the × button to close. Press Escape to close.

- [ ] **Step 5: Commit**

  ```bash
  git add main.js style.css index.html
  git commit -m "feat: cinematic gallery lightbox"
  ```

---

## Task 6: About Canvas — Portrait Particle System

**Files:**
- Modify: `main.js` — add `initAboutCanvas()`, call from constructor
- Modify: `style.css` — position `#about-canvas` correctly

- [ ] **Step 1: Ensure `#about-canvas` CSS is correct in `style.css`**

  Find or add the rule for `#about-canvas`:

  ```css
  #about-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
  }

  .about-stitch {
      position: relative;
  }
  ```

- [ ] **Step 2: Add `initAboutCanvas()` to `main.js`**

  ```javascript
  async initAboutCanvas() {
      const canvas = document.getElementById('about-canvas');
      if (!canvas) return;

      // Sample portrait image for particle targets
      const SAMPLE_W = 100, SAMPLE_H = 140;
      const imgSources = ['about_model.jpeg', 'stats_portrait.png', 'ab1.png'];
      let pixels = null;

      for (const src of imgSources) {
          try {
              pixels = await new Promise((resolve, reject) => {
                  const img = new Image();
                  img.crossOrigin = 'anonymous';
                  img.onload = () => {
                      const oc = document.createElement('canvas');
                      oc.width = SAMPLE_W;
                      oc.height = SAMPLE_H;
                      oc.getContext('2d').drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
                      resolve(oc.getContext('2d').getImageData(0, 0, SAMPLE_W, SAMPLE_H).data);
                  };
                  img.onerror = reject;
                  img.src = src;
              });
              break;
          } catch (e) { /* try next */ }
      }

      // Build normalized target list from bright pixels
      const targets = [];
      if (pixels) {
          for (let y = 0; y < SAMPLE_H; y += 2) {
              for (let x = 0; x < SAMPLE_W; x += 2) {
                  const idx = (y * SAMPLE_W + x) * 4;
                  const lum = (pixels[idx] * 0.299 + pixels[idx + 1] * 0.587 + pixels[idx + 2] * 0.114);
                  if (lum > 40) targets.push({ nx: x / SAMPLE_W, ny: y / SAMPLE_H });
              }
          }
      }

      // Fallback: generate random targets in an oval if no image loaded
      if (!targets.length) {
          for (let i = 0; i < 3000; i++) {
              const angle = Math.random() * Math.PI * 2;
              const r = Math.random();
              targets.push({ nx: 0.5 + Math.cos(angle) * r * 0.3, ny: 0.5 + Math.sin(angle) * r * 0.45 });
          }
      }

      // Cap to 6000 particles
      const MAX_PARTICLES = Math.min(targets.length, 6000);
      const ctx = canvas.getContext('2d');

      // Build particle list — positions in screen pixels
      const particles = targets.slice(0, MAX_PARTICLES).map(t => ({
          nx: t.nx, ny: t.ny,          // normalized target
          x: 0, y: 0,                  // current screen position
          tx: 0, ty: 0,                // target screen position
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          ox: Math.random() * 100,     // noise phase offset
          oy: Math.random() * 100,
          state: 'idle'                // 'idle' | 'forming' | 'formed'
      }));

      let W = 0, H = 0;

      const resize = () => {
          W = canvas.width = canvas.offsetWidth;
          H = canvas.height = canvas.offsetHeight;

          const aspect = SAMPLE_W / SAMPLE_H;
          const ph = H * 0.82;
          const pw = ph * aspect;
          const ox = (W - pw) / 2;
          const oy = (H - ph) * 0.45;

          particles.forEach(p => {
              p.tx = ox + p.nx * pw;
              p.ty = oy + p.ny * ph;
              if (p.state === 'idle') {
                  p.x = Math.random() * W;
                  p.y = Math.random() * H;
              }
          });
      };
      resize();

      let resizeTimer;
      window.addEventListener('resize', () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(resize, 150);
      });

      // Trigger forming on scroll
      let forming = false;
      const triggerForming = () => {
          if (forming) return;
          forming = true;
          particles.forEach((p, i) => {
              p.state = 'forming';
              if (typeof gsap !== 'undefined') {
                  gsap.to(p, {
                      x: p.tx, y: p.ty,
                      duration: 1.8,
                      delay: Math.random() * 0.6,
                      ease: 'back.out(1.2)',
                      onComplete: () => { p.state = 'formed'; }
                  });
              } else {
                  p.x = p.tx; p.y = p.ty; p.state = 'formed';
              }
          });
      };

      if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.create({
              trigger: '#about-canvas',
              start: 'top 75%',
              onEnter: triggerForming,
          });
      }

      // Hover dispersion on media boxes
      document.querySelectorAll('.media-box').forEach(box => {
          box.addEventListener('mouseenter', () => {
              if (!forming) return;
              particles.forEach(p => {
                  if (typeof gsap !== 'undefined') gsap.killTweensOf(p);
                  p.state = 'idle';
                  p.vx = (Math.random() - 0.5) * 8;
                  p.vy = (Math.random() - 0.5) * 8;
              });
              forming = false;
              // Re-form after 1.2s
              setTimeout(() => triggerForming(), 1200);
          });
      });

      // Pseudo-noise
      const noise = (a, b, t) => Math.sin(a * 2.1 + t) * Math.cos(b * 1.9 + t * 0.8) * 0.0035;

      let t = 0;
      const render = () => {
          requestAnimationFrame(render);
          if (!W || !H) return;
          t += 0.004;

          ctx.clearRect(0, 0, W, H);

          for (const p of particles) {
              if (p.state === 'idle') {
                  p.vx += noise(p.ox + t, p.oy, t);
                  p.vy += noise(p.ox, p.oy + t, t * 1.1);
                  p.vx *= 0.96;
                  p.vy *= 0.96;
                  p.x += p.vx;
                  p.y += p.vy;
                  if (p.x < 0) p.x = W;
                  if (p.x > W) p.x = 0;
                  if (p.y < 0) p.y = H;
                  if (p.y > H) p.y = 0;
              }
              // 'forming' and 'formed': GSAP drives p.x, p.y

              ctx.fillStyle = 'rgba(255,255,255,0.75)';
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
              ctx.fill();
          }
      };
      render();
  }
  ```

- [ ] **Step 3: Call `initAboutCanvas()` from constructor**

  ```javascript
  setTimeout(() => {
      this.tryInitLenis();
      this.initGSAP();
      this.initInteractive();
      this.tryInitStatsParticles();
      this.initFilmGrain();
      this.initGallery();
      this.initAboutCanvas(); // ← add this line
  }, 100);
  ```

- [ ] **Step 4: Verify in browser**

  Scroll to "QUIEN SOY". Before entering viewport: white particles drift slowly across the canvas. On scroll entry: particles animate and form the shape of the portrait face. Hovering a `.media-box` image should disperse the particles, then they reform after ~1.2s.

- [ ] **Step 5: Commit**

  ```bash
  git add main.js style.css
  git commit -m "feat: about canvas portrait particle system"
  ```

---

## Task 7: Stats — Orbital Particle Rings

**Files:**
- Modify: `main.js` — rewrite `tryInitStatsParticles()`

- [ ] **Step 1: Rewrite `tryInitStatsParticles()` in `main.js`**

  ```javascript
  tryInitStatsParticles() {
      const canvas = document.querySelector('#particles-stats');
      if (!canvas || typeof THREE === 'undefined') return;
      try {
          const scene = new THREE.Scene();
          const W = canvas.clientWidth || 400;
          const H = canvas.clientHeight || 400;
          const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
          renderer.setSize(W, H);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

          // Inner ring: 300 particles, tight orbit
          const ring1 = (() => {
              const geo = new THREE.BufferGeometry();
              const pos = new Float32Array(300 * 3);
              for (let i = 0; i < 300; i++) {
                  const angle = (i / 300) * Math.PI * 2 + Math.random() * 0.3;
                  const r = 2.8 + (Math.random() - 0.5) * 0.4;
                  pos[i * 3]     = Math.cos(angle) * r;
                  pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
                  pos[i * 3 + 2] = Math.sin(angle) * r;
              }
              geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
              const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0 });
              return new THREE.Points(geo, mat);
          })();

          // Outer ring: 500 particles, wider + tilted
          const ring2 = (() => {
              const geo = new THREE.BufferGeometry();
              const pos = new Float32Array(500 * 3);
              for (let i = 0; i < 500; i++) {
                  const angle = (i / 500) * Math.PI * 2 + Math.random() * 0.5;
                  const r = 4.5 + (Math.random() - 0.5) * 0.6;
                  pos[i * 3]     = Math.cos(angle) * r;
                  pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
                  pos[i * 3 + 2] = Math.sin(angle) * r;
              }
              geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
              const mat = new THREE.PointsMaterial({ color: 0xcccccc, size: 0.035, transparent: true, opacity: 0 });
              const points = new THREE.Points(geo, mat);
              points.rotation.x = 0.3;
              return points;
          })();

          scene.add(ring1, ring2);
          camera.position.z = 8;

          // Fade in on scroll
          if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.create({
                  trigger: '.stats-premium',
                  start: 'top 80%',
                  onEnter: () => {
                      if (typeof gsap !== 'undefined') {
                          gsap.to([ring1.material, ring2.material], { opacity: 0.5, duration: 1.5, ease: 'power2.out' });
                      }
                  }
              });
          }

          const anim = () => {
              requestAnimationFrame(anim);
              ring1.rotation.y += 0.004;
              ring2.rotation.y -= 0.0025;
              renderer.render(scene, camera);
          };
          anim();

          window.addEventListener('resize', () => {
              const nW = canvas.clientWidth;
              const nH = canvas.clientHeight;
              camera.aspect = nW / nH;
              camera.updateProjectionMatrix();
              renderer.setSize(nW, nH);
          });
      } catch (e) { console.error('Stats particles:', e); }
  }
  ```

- [ ] **Step 2: Verify in browser**

  Scroll to the stats section. Two concentric rings of white particles should appear, rotating in opposite directions. The outer ring should be slightly tilted.

- [ ] **Step 3: Commit**

  ```bash
  git add main.js
  git commit -m "feat: orbital particle rings in stats section"
  ```

---

## Task 8: Marquee — Variable Speed on Scroll

**Files:**
- Modify: `main.js` — add `initMarquee()`, call from constructor
- Modify: `style.css` — use CSS variable for marquee duration

- [ ] **Step 1: Update marquee CSS in `style.css`**

  Find `.marquee-content` and update its animation to use a CSS variable:

  ```css
  .marquee-content {
      animation: marquee var(--marquee-duration, 25s) linear infinite;
  }
  ```

  (Keep all other existing marquee rules as-is. Only change the `animation` property to use the variable.)

- [ ] **Step 2: Add `initMarquee()` to `main.js`**

  ```javascript
  initMarquee() {
      const marquee = document.querySelector('.clients');
      if (!marquee) return;

      let currentDuration = 25;
      let targetDuration = 25;
      let lastScrollY = window.scrollY;
      let rafId;

      const update = () => {
          // Lerp current toward target
          currentDuration += (targetDuration - currentDuration) * 0.08;
          marquee.style.setProperty('--marquee-duration', currentDuration.toFixed(1) + 's');
          rafId = requestAnimationFrame(update);
      };
      update();

      const onScroll = () => {
          const delta = Math.abs(window.scrollY - lastScrollY);
          lastScrollY = window.scrollY;
          // Fast scroll → short duration (fast marquee); idle → 25s
          targetDuration = Math.max(8, 25 - delta * 0.5);
      };

      if (this.lenis) {
          this.lenis.on('scroll', onScroll);
      } else {
          window.addEventListener('scroll', onScroll, { passive: true });
      }
  }
  ```

- [ ] **Step 3: Call `initMarquee()` from constructor**

  In the `setTimeout` block:

  ```javascript
  setTimeout(() => {
      this.tryInitLenis();
      this.initGSAP();
      this.initInteractive();
      this.tryInitStatsParticles();
      this.initFilmGrain();
      this.initGallery();
      this.initAboutCanvas();
      this.initMarquee(); // ← add this line
  }, 100);
  ```

- [ ] **Step 4: Verify in browser**

  Scroll fast through the page — when passing the clients marquee section, the brand names should scroll faster. When idle, they slow back to the default pace.

- [ ] **Step 5: Commit**

  ```bash
  git add main.js style.css
  git commit -m "feat: marquee variable scroll-speed"
  ```

---

## Task 9: Final Verification Pass

- [ ] **Step 1: Verify `prefers-reduced-motion` respect**

  In `style.css`, add at the end:

  ```css
  @media (prefers-reduced-motion: reduce) {
      #about-canvas,
      #particles-stats {
          display: none;
      }
      .marquee-content {
          animation-duration: 60s !important;
      }
  }
  ```

- [ ] **Step 2: Full browser walkthrough**

  Check each section in order:
  - Loader completes → hero portrait fades in at 0.65 opacity ✓
  - Mouse move shifts hero text and portrait in opposite directions ✓
  - Film grain visible on light backgrounds ✓
  - Cursor shows viewfinder ticks, expands on hover targets ✓
  - "QUIEN SOY" canvas: particles drift idle, form portrait on scroll ✓
  - Gallery images wipe in from bottom, hover shows grain + zoom, click opens lightbox ✓
  - Stats: two orbital rings fade in ✓
  - Clients marquee speeds up on fast scroll ✓

- [ ] **Step 3: Final commit**

  ```bash
  git add style.css
  git commit -m "feat: reduced-motion accessibility guard for particles"
  ```
