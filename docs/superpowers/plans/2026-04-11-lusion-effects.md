# Lusion Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar efectos Lusion.co (hero cinemático, partículas Three.js, cursor magnético, tilt 3D, galería scroll horizontal con displacement) al portfolio de Antonella Dimenza sin nuevas dependencias.

**Architecture:** Cuatro nuevas clases JS (`FluidParticles`, `MagneticElement`, `TiltEffect`, `HorizontalGallery`) se añaden a `main.js` y se instancian desde `AntonellaApp`. El HTML del hero y la galería se reestructuran completamente; `style.css` recibe bloques nuevos y se eliminan los bloques de hero/gallery obsoletos.

**Tech Stack:** Three.js r162 (ya instalado), GSAP 3 + ScrollTrigger (ya instalado), Lenis (ya instalado), GLSL inline, SVG feTurbulence para displacement.

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `index.html` | Modificar | Reestructurar `.hero`, reemplazar `.gallery`, añadir SVG filter de displacement |
| `style.css` | Modificar | Eliminar CSS hero/gallery obsoleto, añadir estilos nuevos |
| `main.js` | Modificar | Añadir 4 clases, actualizar `AntonellaApp`, eliminar métodos obsoletos |

---

## Task 1: Reestructurar Hero HTML

**Files:**
- Modify: `index.html` (sección `.hero`, líneas ~43–59)

- [ ] **Step 1: Reemplazar el bloque `.hero` completo**

Abrir `index.html`. Localizar la sección `<section class="hero">` y reemplazar su contenido completo por:

```html
<section class="hero">
    <!-- Canvas de partículas Three.js — inyectado por FluidParticles -->

    <!-- Retrato lado derecho -->
    <div class="hero-portrait-wrap">
        <img src="about_model.jpeg" alt="Antonella Dimenza" id="hero-portrait">
        <div class="hero-portrait-gradient"></div>
    </div>

    <!-- Contenido lado izquierdo -->
    <div class="hero-content">
        <span class="hero-eyebrow">/ Modelo de Alta Costura</span>
        <h1 class="hero-title">
            <span class="hero-title-line" data-split="true">ANTONELLA</span>
            <span class="hero-title-line hero-title-outline" data-split="true">DIMENZA</span>
        </h1>
        <div class="hero-divider"></div>
        <p class="hero-subtext">Especializada en campañas Editoriales,<br>de Pasarela y Comerciales.</p>
        <button class="btn-open-bio btn-hero-cta">BIOGRAFÍA / BIO</button>
    </div>

    <!-- Indicador de scroll -->
    <div class="scroll-indicator">
        <div class="scroll-line-anim"></div>
        <span>SCROLL</span>
    </div>
</section>
```

- [ ] **Step 2: Verificar en navegador**

Abrir el sitio en el navegador. El hero debe mostrar la foto de Antonella a la derecha y un bloque de texto vacío a la izquierda. No se requiere estilos correctos aún — solo confirmar que no hay errores en consola del HTML.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "refactor: restructure hero section to cinematic-b layout"
```

---

## Task 2: Reemplazar Gallery HTML

**Files:**
- Modify: `index.html` (sección `.gallery`, líneas ~64–79)

- [ ] **Step 1: Reemplazar sección `.gallery` por galería horizontal**

Localizar `<section class="gallery">` y reemplazarla por:

```html
<section class="gallery-horizontal">
    <!-- SVG Filter para displacement hover — oculto, solo define el filtro -->
    <svg style="display:none" aria-hidden="true">
        <defs>
            <filter id="disp-0"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="1" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp-map-0"/></filter>
            <filter id="disp-1"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="3" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp-map-1"/></filter>
            <filter id="disp-2"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="5" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp-map-2"/></filter>
            <filter id="disp-3"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp-map-3"/></filter>
            <filter id="disp-4"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="9" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp-map-4"/></filter>
            <filter id="disp-5"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="11" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp-map-5"/></filter>
            <filter id="disp-6"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="13" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp-map-6"/></filter>
            <filter id="disp-7"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="15" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp-map-7"/></filter>
        </defs>
    </svg>

    <div class="gallery-track">
        <div class="gallery-h-item tilt-target" data-index="0">
            <div class="gallery-h-img-wrap" data-disp="0" style="filter:url(#disp-0)">
                <img src="f1.png" alt="Editorial 1">
            </div>
            <div class="gallery-h-info"><span class="gallery-h-num">01</span><p>Editorial</p></div>
        </div>
        <div class="gallery-h-item tilt-target" data-index="1">
            <div class="gallery-h-img-wrap" data-disp="1" style="filter:url(#disp-1)">
                <img src="f2.png" alt="Editorial 2">
            </div>
            <div class="gallery-h-info"><span class="gallery-h-num">02</span><p>Runway</p></div>
        </div>
        <div class="gallery-h-item tilt-target" data-index="2">
            <div class="gallery-h-img-wrap" data-disp="2" style="filter:url(#disp-2)">
                <img src="f3.png" alt="Editorial 3">
            </div>
            <div class="gallery-h-info"><span class="gallery-h-num">03</span><p>Pasarela</p></div>
        </div>
        <div class="gallery-h-item tilt-target" data-index="3">
            <div class="gallery-h-img-wrap" data-disp="3" style="filter:url(#disp-3)">
                <img src="f4.png" alt="Commercial">
            </div>
            <div class="gallery-h-info"><span class="gallery-h-num">04</span><p>Comercial</p></div>
        </div>
        <div class="gallery-h-item tilt-target" data-index="4">
            <div class="gallery-h-img-wrap" data-disp="4" style="filter:url(#disp-4)">
                <img src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=800&auto=format&fit=crop" alt="Editorial 5">
            </div>
            <div class="gallery-h-info"><span class="gallery-h-num">05</span><p>Editorial</p></div>
        </div>
        <div class="gallery-h-item tilt-target" data-index="5">
            <div class="gallery-h-img-wrap" data-disp="5" style="filter:url(#disp-5)">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" alt="Editorial 6">
            </div>
            <div class="gallery-h-info"><span class="gallery-h-num">06</span><p>Alta Costura</p></div>
        </div>
        <div class="gallery-h-item tilt-target" data-index="6">
            <div class="gallery-h-img-wrap" data-disp="6" style="filter:url(#disp-6)">
                <img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop" alt="Editorial 7">
            </div>
            <div class="gallery-h-info"><span class="gallery-h-num">07</span><p>Campaña</p></div>
        </div>
        <div class="gallery-h-item tilt-target" data-index="7">
            <div class="gallery-h-img-wrap" data-disp="7" style="filter:url(#disp-7)">
                <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop" alt="Editorial 8">
            </div>
            <div class="gallery-h-info"><span class="gallery-h-num">08</span><p>Vogue</p></div>
        </div>
    </div>

    <div class="gallery-progress">
        <span class="gallery-current">01</span>
        <div class="gallery-bar"><div class="gallery-bar-fill"></div></div>
        <span class="gallery-total">08</span>
    </div>
</section>
```

- [ ] **Step 2: Verificar en navegador**

Las imágenes de la galería deben ser visibles apiladas verticalmente (sin estilos horizontales aún). Las 4 imágenes propias + 4 de Unsplash deben cargar sin errores 404.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "refactor: replace grid gallery with horizontal gallery structure"
```

---

## Task 3: CSS — Hero Cinemático

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Eliminar CSS obsoleto del hero**

En `style.css`, buscar y eliminar completamente los bloques:
- `.hero-bg { ... }` 
- `.hero-bg img { ... }`
- `.hero-grid-reveal { ... }`
- `.grid-square { ... }`
- `.light-sweep { ... }`
- `.hero-svg-text { ... }`
- `.hero-image-container, .stats-image-container, ...` (el bloque de parallax que incluye `.hero-image-container`)
- `.hero-image, .stats-image, .gallery-item img, ...` (bloque parallax height 140%)

- [ ] **Step 2: Reemplazar el bloque `.hero { ... }` existente**

Localizar `.hero { height: 100vh; ... }` y reemplazarlo por:

```css
/* ============================================
   HERO — CINEMATIC B
   ============================================ */
.hero {
    height: 100vh;
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: #050505;
}

.hero-portrait-wrap {
    position: absolute;
    right: 0;
    top: 0;
    width: 55%;
    height: 100%;
    overflow: hidden;
}

.hero-portrait-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    filter: grayscale(0.15) contrast(1.05);
    opacity: 0.75;
}

.hero-portrait-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, #050505 10%, transparent 100%);
}

.hero-content {
    position: relative;
    z-index: 10;
    padding: 0 8vw;
    max-width: 700px;
}

.hero-eyebrow {
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    color: #c8a96e;
    text-transform: uppercase;
    margin-bottom: 20px;
    opacity: 0; /* animated in by GSAP */
}

.hero-title {
    font-size: clamp(3.5rem, 8vw, 7.5rem);
    font-weight: 900;
    line-height: 0.88;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    margin-bottom: 24px;
}

.hero-title-line {
    display: block;
    overflow: hidden; /* clips letter reveal */
}

.hero-title-line span {
    display: inline-block;
    opacity: 0;
    transform: translateY(110%);
    /* animated by GSAP */
}

.hero-title-outline {
    -webkit-text-stroke: 1.5px #c8a96e;
    color: transparent;
}

.hero-divider {
    width: 0px; /* animated to 50px by GSAP */
    height: 1px;
    background: #c8a96e;
    margin-bottom: 20px;
}

.hero-subtext {
    font-size: 0.85rem;
    line-height: 1.7;
    letter-spacing: 0.05em;
    color: rgba(240, 240, 240, 0.6);
    max-width: 380px;
    margin-bottom: 36px;
    opacity: 0; /* animated */
}

.btn-hero-cta {
    opacity: 0; /* animated */
}

.scroll-indicator {
    position: absolute;
    bottom: 36px;
    left: 8vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 10;
}

.scroll-line-anim {
    width: 1px;
    height: 50px;
    background: linear-gradient(to bottom, #c8a96e, transparent);
    animation: scrollPulse 2s ease-in-out infinite;
    transform-origin: top;
}

@keyframes scrollPulse {
    0%, 100% { transform: scaleY(1); opacity: 1; }
    50% { transform: scaleY(0.4); opacity: 0.4; }
}

.scroll-indicator span {
    font-size: 0.55rem;
    letter-spacing: 0.3em;
    color: #555;
    text-transform: uppercase;
}
```

- [ ] **Step 3: Verificar en navegador**

El hero debe mostrar: foto de Antonella a la derecha con degradado, bloque de contenido a la izquierda, scroll indicator abajo. Los textos no son visibles aún (opacity: 0 — se animarán con GSAP). Confirmar sin errores CSS en consola.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "style: replace hero CSS with cinematic-b layout"
```

---

## Task 4: CSS — Galería Horizontal + Tilt + Displacement

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Eliminar CSS obsoleto de galería**

Buscar y eliminar en `style.css` los bloques:
- `.gallery { padding: 100px 30px; ... }`
- `.gallery-container { display: grid; ... }`
- `.gallery-item { ... }`
- `.gallery-item img { ... }`
- `.gallery-item:hover img { ... }`
- `.gallery-item.large { ... }`
- `.gallery-item.tall { ... }`
- Los bloques `/* SPECTACULAR IMAGE HOVER */` que referencian `.gallery-item`

- [ ] **Step 2: Añadir CSS de galería horizontal al final de `style.css`**

```css
/* ============================================
   GALERÍA HORIZONTAL
   ============================================ */
.gallery-horizontal {
    position: relative;
    height: 100vh;
    overflow: hidden;
    background: #000;
}

.gallery-track {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 24px;
    padding: 0 8vw;
    will-change: transform;
}

.gallery-h-item {
    flex-shrink: 0;
    width: 320px;
    position: relative;
    cursor: none;
    transform-style: preserve-3d;
    transition: none; /* GSAP maneja el tilt */
}

.gallery-h-img-wrap {
    width: 320px;
    height: 460px;
    overflow: hidden;
    position: relative;
    border-radius: 4px;
    /* filter:url(#disp-N) se aplica inline en HTML */
}

.gallery-h-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
}

.gallery-h-item:hover .gallery-h-img-wrap img {
    transform: scale(1.04);
}

/* Highlight de tilt (sigue al cursor) */
.gallery-h-item::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 4px;
    background: radial-gradient(
        circle at var(--hx, 50%) var(--hy, 50%),
        rgba(200,169,110,0.12) 0%,
        transparent 60%
    );
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.gallery-h-item:hover::after {
    opacity: 1;
}

.gallery-h-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    padding-left: 4px;
}

.gallery-h-num {
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    color: #c8a96e;
    font-weight: 700;
}

.gallery-h-info p {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    color: #555;
    text-transform: uppercase;
}

/* Barra de progreso */
.gallery-progress {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 10;
}

.gallery-current,
.gallery-total {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    color: #555;
    font-weight: 700;
    min-width: 20px;
}

.gallery-current {
    color: #c8a96e;
}

.gallery-bar {
    width: 120px;
    height: 1px;
    background: #222;
    position: relative;
    overflow: hidden;
}

.gallery-bar-fill {
    position: absolute;
    inset: 0;
    background: #c8a96e;
    transform: scaleX(0);
    transform-origin: left;
    transition: none; /* actualizado por ScrollTrigger */
}

/* ============================================
   TILT 3D — clases de soporte
   ============================================ */
.tilt-target {
    transform-style: preserve-3d;
    will-change: transform;
}

.service-item {
    transform-style: preserve-3d;
    will-change: transform;
}
```

- [ ] **Step 3: Verificar en navegador**

La galería debe verse como una fila de imágenes en portrait (320×460px) con espacio entre ellas. El scroll horizontal no funciona aún (se añade en Task 8). Verificar que se ven las 8 imágenes sin errores.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "style: add horizontal gallery, tilt and displacement CSS"
```

---

## Task 5: FluidParticles — Three.js con GLSL

**Files:**
- Modify: `main.js` (añadir clase antes de `class AntonellaApp`)

- [ ] **Step 1: Añadir clase `FluidParticles` al inicio de `main.js`, antes de la clase `Particle` existente**

```javascript
class FluidParticles {
    constructor(container) {
        this.container = container;
        this.mouse = { nx: 0, ny: 0 };
        this._raf = null;
        this._init();
    }

    _init() {
        const w = this.container.offsetWidth;
        const h = this.container.offsetHeight;

        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = [
            'position:absolute', 'inset:0', 'width:100%', 'height:100%',
            'pointer-events:none', 'z-index:3'
        ].join(';');
        this.container.appendChild(this.canvas);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
        this.camera.position.z = 3;

        this._createParticles();
        this._bindEvents();
        this._tick();
    }

    _createParticles() {
        const COUNT = 280;
        const positions = new Float32Array(COUNT * 3);
        const randoms   = new Float32Array(COUNT);

        for (let i = 0; i < COUNT; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 9;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
            randoms[i] = Math.random();
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aRandom',  new THREE.BufferAttribute(randoms, 1));

        const vertexShader = `
            attribute float aRandom;
            uniform float uTime;
            uniform vec2  uMouse;
            varying float vAlpha;

            void main() {
                vec3 pos = position;

                // Animación flotante suave
                pos.x += sin(uTime * 0.35 + aRandom * 6.283) * 0.09;
                pos.y += cos(uTime * 0.28 + aRandom * 6.283) * 0.07;

                // Repulsión del mouse
                vec2 toMouse = pos.xy - uMouse * vec2(4.5, 2.7);
                float dist   = length(toMouse);
                float strength = smoothstep(1.4, 0.0, dist) * 0.7;
                pos.xy += normalize(toMouse + vec2(0.001)) * strength;

                vAlpha = 0.25 + aRandom * 0.55;

                vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = (1.8 + aRandom * 2.2) * (280.0 / -mvPos.z);
                gl_Position  = projectionMatrix * mvPos;
            }
        `;

        const fragmentShader = `
            varying float vAlpha;
            void main() {
                vec2  uv  = gl_PointCoord - 0.5;
                float d   = length(uv);
                float cir = 1.0 - smoothstep(0.28, 0.5, d);
                if (cir < 0.01) discard;
                gl_FragColor = vec4(0.784, 0.663, 0.431, vAlpha * cir); // #c8a96e
            }
        `;

        this.mat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime:  { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) }
            },
            transparent: true,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending
        });

        this.points = new THREE.Points(geo, this.mat);
        this.scene.add(this.points);
    }

    _bindEvents() {
        window.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.nx =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
            this.mouse.ny = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            const w = this.container.offsetWidth;
            const h = this.container.offsetHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    _tick() {
        this._raf = requestAnimationFrame((t) => this._tick(t));
        if (this.mat) {
            this.mat.uniforms.uTime.value  += 0.016;
            this.mat.uniforms.uMouse.value.set(this.mouse.nx, this.mouse.ny);
        }
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        cancelAnimationFrame(this._raf);
        this.renderer.dispose();
        if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    }
}
```

- [ ] **Step 2: Verificar sintaxis**

```bash
node -e "const fs = require('fs'); const code = fs.readFileSync('main.js','utf8'); new Function(code); console.log('OK');"
```

Resultado esperado: `OK` (sin errores de parse).

- [ ] **Step 3: Commit**

```bash
git add main.js
git commit -m "feat: add FluidParticles class with Three.js GLSL shaders"
```

---

## Task 6: Hero Reveal — Texto letra a letra

**Files:**
- Modify: `main.js` — método `animateHero()` y nuevo método `_splitTitleLetters()`

- [ ] **Step 1: Reemplazar el método `animateHero()` en `AntonellaApp` y añadir `_splitTitleLetters()`**

Localizar `animateHero() {` en `main.js` y reemplazar el método completo por:

```javascript
_splitTitleLetters() {
    // Envuelve cada letra de .hero-title-line en un <span>
    document.querySelectorAll('.hero-title-line[data-split]').forEach(line => {
        const text = line.textContent.trim();
        line.textContent = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            line.appendChild(span);
        });
    });
}

animateHero() {
    if (typeof gsap === 'undefined') return;

    this._splitTitleLetters();

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Eyebrow
    tl.fromTo('.hero-eyebrow',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0
    );

    // Letras del título — stagger por carácter
    tl.to('.hero-title-line span', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.035
    }, 0.15);

    // Línea divisora
    tl.fromTo('.hero-divider',
        { width: 0 },
        { width: 50, duration: 0.8, ease: 'expo.out' },
        0.5
    );

    // Subtexto y botón
    tl.fromTo('.hero-subtext',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        0.7
    );
    tl.fromTo('.btn-hero-cta',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.9
    );
}
```

- [ ] **Step 2: Eliminar el método `initHeroGridReveal()` completo** de `AntonellaApp` (ya no existe el `#hero-grid` en el HTML).

Buscar `initHeroGridReveal() {` y eliminar ese método completo incluyendo su cierre `}`.

- [ ] **Step 3: Eliminar la llamada a `initHeroGridReveal` del constructor**

En el bloque `setTimeout(() => { ... }, 100)` del constructor de `AntonellaApp`, eliminar la línea:
```javascript
this.initHeroGridReveal();
```

- [ ] **Step 4: Verificar en navegador**

Recargar la página. Tras el loader, deben verse las letras de ANTONELLA y DIMENZA animarse letra a letra desde abajo hacia arriba. La línea dorada se extiende y el subtexto aparece con fade.

- [ ] **Step 5: Commit**

```bash
git add main.js
git commit -m "feat: add letter-by-letter hero title reveal with GSAP"
```

---

## Task 7: MagneticElement — Cursor magnético

**Files:**
- Modify: `main.js` (añadir clase antes de `AntonellaApp`)

- [ ] **Step 1: Añadir clase `MagneticElement` a `main.js`**

Insertar antes de `class AntonellaApp`:

```javascript
class MagneticElement {
    constructor(el, strength = 0.38) {
        this.el = el;
        this.strength = strength;
        this.bounds = null;
        this._onMove  = this._onMove.bind(this);
        this._onLeave = this._onLeave.bind(this);
        this._addListeners();
    }

    _addListeners() {
        this.el.addEventListener('mouseenter', () => {
            this.bounds = this.el.getBoundingClientRect();
        });
        this.el.addEventListener('mousemove',  this._onMove);
        this.el.addEventListener('mouseleave', this._onLeave);
    }

    _onMove(e) {
        if (!this.bounds) this.bounds = this.el.getBoundingClientRect();
        const cx = this.bounds.left + this.bounds.width  / 2;
        const cy = this.bounds.top  + this.bounds.height / 2;
        const dx = (e.clientX - cx) * this.strength;
        const dy = (e.clientY - cy) * this.strength;
        if (typeof gsap !== 'undefined') {
            gsap.to(this.el, { x: dx, y: dy, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        }
    }

    _onLeave() {
        if (typeof gsap !== 'undefined') {
            gsap.to(this.el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
        }
        this.bounds = null;
    }

    static applyAll() {
        document.querySelectorAll('button, nav a, .footer-links span').forEach(el => {
            new MagneticElement(el);
        });
    }
}
```

- [ ] **Step 2: Registrar en `AntonellaApp`**

En el bloque `setTimeout(() => { ... }, 100)` del constructor de `AntonellaApp`, añadir al final:

```javascript
MagneticElement.applyAll();
```

- [ ] **Step 3: Verificar en navegador**

Pasar el cursor sobre cualquier botón (ej. "BIOGRAFÍA / BIO"). El botón debe desplazarse suavemente hacia el cursor y volver con rebote elástico al salir.

- [ ] **Step 4: Commit**

```bash
git add main.js
git commit -m "feat: add MagneticElement class for cursor magnetic effect"
```

---

## Task 8: TiltEffect — Inclinación 3D en hover

**Files:**
- Modify: `main.js` (añadir clase antes de `AntonellaApp`)

- [ ] **Step 1: Añadir clase `TiltEffect` a `main.js`**

```javascript
class TiltEffect {
    constructor(el, maxTilt = 14) {
        this.el  = el;
        this.max = maxTilt;
        this._addListeners();
    }

    _addListeners() {
        this.el.addEventListener('mousemove', (e) => {
            const rect = this.el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;   // 0–1
            const y = (e.clientY - rect.top)  / rect.height;  // 0–1
            const rotY =  (x - 0.5) * this.max * 2;
            const rotX = -(y - 0.5) * this.max * 2;

            // CSS custom props para el highlight
            this.el.style.setProperty('--hx', `${x * 100}%`);
            this.el.style.setProperty('--hy', `${y * 100}%`);

            if (typeof gsap !== 'undefined') {
                gsap.to(this.el, {
                    rotateX: rotX,
                    rotateY: rotY,
                    transformPerspective: 800,
                    duration: 0.4,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            }
        });

        this.el.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(this.el, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    overwrite: 'auto'
                });
            }
        });
    }

    static applyAll(selector = '.gallery-h-item, .service-item') {
        document.querySelectorAll(selector).forEach(el => new TiltEffect(el));
    }
}
```

- [ ] **Step 2: Registrar en `AntonellaApp`**

En el bloque `setTimeout(() => { ... }, 100)`, añadir:

```javascript
TiltEffect.applyAll();
```

- [ ] **Step 3: Verificar en navegador**

Pasar el cursor sobre una imagen de servicios. Debe inclinarse en 3D siguiendo el mouse con un highlight dorado sutil. Al salir, vuelve suavemente a plano.

- [ ] **Step 4: Commit**

```bash
git add main.js
git commit -m "feat: add TiltEffect class for 3D hover tilt on gallery and service items"
```

---

## Task 9: HorizontalGallery — Scroll horizontal pinned

**Files:**
- Modify: `main.js` (añadir clase antes de `AntonellaApp`)

- [ ] **Step 1: Añadir clase `HorizontalGallery`**

```javascript
class HorizontalGallery {
    constructor() {
        this.section    = document.querySelector('.gallery-horizontal');
        this.track      = document.querySelector('.gallery-track');
        this.currentEl  = document.querySelector('.gallery-current');
        this.fillEl     = document.querySelector('.gallery-bar-fill');
        if (!this.section || !this.track) return;
        this._init();
    }

    _init() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const items      = this.track.querySelectorAll('.gallery-h-item');
        const totalItems = items.length;

        gsap.to(this.track, {
            x: () => -(this.track.scrollWidth - window.innerWidth + 160),
            ease: 'none',
            scrollTrigger: {
                trigger:            this.section,
                start:              'top top',
                end:                () => `+=${this.track.scrollWidth - window.innerWidth + 160}`,
                pin:                true,
                scrub:              1.2,
                anticipatePin:      1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const idx = Math.round(self.progress * (totalItems - 1));
                    if (this.currentEl) {
                        this.currentEl.textContent = String(idx + 1).padStart(2, '0');
                    }
                    if (this.fillEl) {
                        this.fillEl.style.transform = `scaleX(${self.progress})`;
                    }
                }
            }
        });
    }
}
```

- [ ] **Step 2: Registrar en `AntonellaApp`**

En el bloque `setTimeout(() => { ... }, 100)`, añadir:

```javascript
new HorizontalGallery();
```

- [ ] **Step 3: Verificar en navegador**

Al llegar a la sección de galería y hacer scroll, las imágenes deben desplazarse horizontalmente. El número `01` → `08` debe actualizarse y la barra de progreso debe llenarse.

- [ ] **Step 4: Commit**

```bash
git add main.js
git commit -m "feat: add HorizontalGallery with GSAP ScrollTrigger pinned scroll"
```

---

## Task 10: FluidParticles + DisplacementHover — Instanciar y conectar

**Files:**
- Modify: `main.js` — instanciar `FluidParticles` y añadir lógica de displacement

- [ ] **Step 1: Instanciar `FluidParticles` en `AntonellaApp`**

En el bloque `setTimeout(() => { ... }, 100)` del constructor, añadir al inicio (antes de `this.tryInitLenis()`):

```javascript
// Partículas del hero
if (typeof THREE !== 'undefined') {
    const heroSection = document.querySelector('.hero');
    if (heroSection) this.fluidParticles = new FluidParticles(heroSection);
}
```

- [ ] **Step 2: Añadir método `initDisplacement()` a `AntonellaApp`**

Dentro de la clase `AntonellaApp`, añadir este método:

```javascript
initDisplacement() {
    document.querySelectorAll('.gallery-h-img-wrap[data-disp]').forEach(wrap => {
        const idx     = wrap.getAttribute('data-disp');
        const mapEl   = document.getElementById(`disp-map-${idx}`);
        if (!mapEl) return;

        let current = 0;
        let target  = 0;
        let rafId   = null;

        const lerp = (a, b, t) => a + (b - a) * t;

        const animate = () => {
            current = lerp(current, target, 0.08);
            mapEl.setAttribute('scale', current.toFixed(2));
            if (Math.abs(current - target) > 0.1) {
                rafId = requestAnimationFrame(animate);
            } else {
                mapEl.setAttribute('scale', target);
                rafId = null;
            }
        };

        wrap.addEventListener('mouseenter', () => {
            target = 22;
            if (!rafId) rafId = requestAnimationFrame(animate);
        });

        wrap.addEventListener('mousemove', (e) => {
            const rect = wrap.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top)  / rect.height;
            // Intensidad varía según posición del cursor
            target = 14 + Math.abs(x - 0.5) * 20 + Math.abs(y - 0.5) * 20;
            if (!rafId) rafId = requestAnimationFrame(animate);
        });

        wrap.addEventListener('mouseleave', () => {
            target = 0;
            if (!rafId) rafId = requestAnimationFrame(animate);
        });
    });
}
```

- [ ] **Step 3: Llamar a `initDisplacement()` desde el constructor**

En el bloque `setTimeout(() => { ... }, 100)`, añadir:

```javascript
this.initDisplacement();
```

- [ ] **Step 4: Actualizar el parallax GSAP para excluir el viejo `.hero-image`**

En `initGSAP()`, el selector del parallax menciona `.hero-image` que ya no existe. Reemplazar la línea:

```javascript
document.querySelectorAll('.hero-image, .stats-image, .gallery-item img, .media-box img, .contact-image, .floating-portrait img').forEach(img => {
```

por:

```javascript
document.querySelectorAll('.stats-image, .media-box img, .contact-image').forEach(img => {
```

- [ ] **Step 5: Verificar en navegador — checklist completo**

Verificar uno a uno:
1. ✅ Partículas doradas animadas sobre el hero, se alejan del cursor
2. ✅ Letras del título se revelan al cargar
3. ✅ Botones se desplazan magnéticamente
4. ✅ Imágenes de galería y servicios se inclinan en 3D
5. ✅ Scroll en la galería avanza horizontalmente, contador `01–08` actualiza
6. ✅ Hover en imágenes de galería produce distorsión de displacement
7. ✅ Sin errores en consola del navegador

- [ ] **Step 6: Commit final**

```bash
git add main.js
git commit -m "feat: wire up FluidParticles, DisplacementHover and clean up obsolete GSAP selectors"
```

---

## Resumen de commits esperados

```
feat: wire up FluidParticles, DisplacementHover and clean up obsolete GSAP selectors
feat: add HorizontalGallery with GSAP ScrollTrigger pinned scroll
feat: add TiltEffect class for 3D hover tilt on gallery and service items
feat: add MagneticElement class for cursor magnetic effect
feat: add letter-by-letter hero title reveal with GSAP
feat: add FluidParticles class with Three.js GLSL shaders
style: add horizontal gallery, tilt and displacement CSS
style: replace hero CSS with cinematic-b layout
refactor: replace grid gallery with horizontal gallery structure
refactor: restructure hero section to cinematic-b layout
```
