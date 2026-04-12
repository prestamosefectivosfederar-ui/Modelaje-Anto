// Antonella Portfolio - Lusion.co Style Experience

// ============================================================
// FluidParticles — Three.js GLSL shader particles for hero
// ============================================================
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

                pos.x += sin(uTime * 0.35 + aRandom * 6.283) * 0.09;
                pos.y += cos(uTime * 0.28 + aRandom * 6.283) * 0.07;

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
                gl_FragColor = vec4(0.784, 0.663, 0.431, vAlpha * cir);
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
        this._raf = requestAnimationFrame(() => this._tick());
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

// ============================================================
// MagneticElement — cursor magnético en botones y links
// ============================================================
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


// ============================================================
// HorizontalGallery — scroll horizontal pinned con GSAP
// ============================================================
class HorizontalGallery {
    constructor() {
        this.section   = document.querySelector('.gallery-horizontal');
        this.track     = document.querySelector('.gallery-track');
        this.currentEl = document.querySelector('.gallery-current');
        this.fillEl    = document.querySelector('.gallery-bar-fill');
        if (!this.section || !this.track) return;
        this._init();
    }

    _init() {
        if (typeof gsap === 'undefined') return;

        // Clone items for infinite loop
        const items = Array.from(this.track.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            this.track.appendChild(clone);
        });

        // Calculate total width
        const totalItems = items.length;
        const scrollWidth = this.track.scrollWidth / 2;

        // Auto-moving Infinite Marquee logic
        const marquee = gsap.to(this.track, {
            x: -scrollWidth,
            duration: 45, // Velocidad elegante
            ease: "none",
            repeat: -1,
            onUpdate: () => {
                // Update progress bar and number based on position
                const progress = Math.abs(gsap.getProperty(this.track, "x") / scrollWidth);
                const idx = Math.floor(progress * totalItems);
                if (this.currentEl) {
                    this.currentEl.textContent = String((idx % totalItems) + 1).padStart(2, '0');
                }
                if (this.fillEl) {
                    this.fillEl.style.transform = `scaleX(${progress})`;
                }
            }
        });

        // Optional: Slow down on segments or keep it constant
        // For now, constant refined movement as requested
    }
}

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
        this.vx += Math.cos(flowAngle) * 0.05;
        this.vy += Math.sin(flowAngle) * 0.05;

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

        this.vx *= 0.95;
        this.vy *= 0.95;

        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;

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

class AntonellaApp {
    constructor() {
        console.log('AntonellaApp: Initializing...');
        this.initLoader();
        
        // Use a small delay to ensure CDNs are parsed
        setTimeout(() => {
            // Partículas Three.js en el hero
            if (typeof THREE !== 'undefined') {
                const heroSection = document.querySelector('.hero');
                if (heroSection) this.fluidParticles = new FluidParticles(heroSection);
            }
            this.tryInitLenis();
            this.initGSAP();
            this.initInteractive();
            this.tryInitStatsParticles();
            this.initFilmGrain();
            this.initOverlays();
            new HorizontalGallery();
            MagneticElement.applyAll();
        }, 100);
    }

    initLoader() {
        const loaderPercent = document.querySelector('.loader-percent');
        const loaderProgress = document.querySelector('.loader-progress');
        const loader = document.querySelector('#loader');
        let percentage = 0;

        const interval = setInterval(() => {
            percentage += Math.floor(Math.random() * 20) + 10;
            if (percentage >= 100) {
                percentage = 100;
                clearInterval(interval);
                this.revealPage(loader);
            }
            if (loaderPercent) loaderPercent.innerText = percentage.toString().padStart(2, '0');
            if (loaderProgress) loaderProgress.style.width = percentage + '%';
        }, 30);

        // Ultimate Fail-safe: Hide loader after 3s no matter what
        setTimeout(() => {
            if (document.body.classList.contains('loading')) {
                console.warn('AntonellaApp: Failsafe triggered.');
                this.revealPage(loader);
            }
        }, 3000);
    }

    revealPage(loader) {
        if (!loader) {
            document.body.classList.remove('loading');
            return;
        }
        
        if (typeof gsap !== 'undefined') {
            gsap.to(loader, {
                yPercent: -100,
                duration: 1,
                ease: "expo.inOut",
                onComplete: () => {
                    document.body.classList.remove('loading');
                    loader.style.display = 'none';
                    this.animateHero();
                }
            });
        } else {
            document.body.classList.remove('loading');
            loader.style.display = 'none';
        }
    }

    tryInitLenis() {
        try {
            if (typeof Lenis !== 'undefined') {
                this.lenis = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                });
                const raf = (time) => {
                    this.lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
                if (typeof ScrollTrigger !== 'undefined') {
                    this.lenis.on('scroll', ScrollTrigger.update);
                }
            }
        } catch (e) { console.error(e); }
    }

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

    animateHero() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        // 1. Scanline Reveal
        tl.set('.hero-scanline', { display: 'block', top: '-100%' });
        tl.to('.hero-scanline', { top: '100%', duration: 1.2, ease: 'expo.inOut' });

        // 2. Background Monumental Text
        tl.fromTo('.hero-bg-text',
            { x: -100, opacity: 0 },
            { x: 0, opacity: 0.03, duration: 2.5, ease: 'power2.out' },
            0.5
        );

        // 3. Main Portrait
        tl.fromTo('.hero-portrait-impact img',
            { scale: 1.3, filter: 'brightness(0) contrast(1.5)' },
            { scale: 1.1, filter: 'brightness(0.9) contrast(1.1)', duration: 3, ease: 'power2.out' },
            0.6
        );

        // 4. Surname Floating Reveal
        tl.fromTo('.surname-float',
            { y: 100, opacity: 0, scale: 0.9, letterSpacing: '0.2em' },
            { y: 0, opacity: 1, scale: 1, letterSpacing: 'normal', duration: 2, ease: 'expo.out' },
            1.2
        );

        // 5. Meta & Description
        tl.fromTo('.hero-editorial-meta, .hero-description-impact',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, stagger: 0.2 },
            1.8
        );

        // 6. Circle Button
        tl.fromTo('.hero-circle-btn',
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.7)' },
            2.2
        );

        // Initialize Mouse Parallax for Surname
        this.initHeroParallax();
    }

    initHeroParallax() {
        const hero = document.querySelector('.hero-impact');
        const surname = document.querySelector('.surname-float');
        const bgText = document.querySelector('.hero-bg-text');

        if (!hero || !surname) return;

        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const moveX = (clientX - centerX) / 25;
            const moveY = (clientY - centerY) / 25;

            gsap.to(surname, {
                x: moveX,
                y: moveY,
                duration: 1,
                ease: 'power2.out'
            });

            gsap.to(bgText, {
                x: -moveX * 0.5,
                duration: 1.5,
                ease: 'power2.out'
            });
        });
    }

    initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        // Standard Reveals - Fixed to use fromTo so they don't stay at opacity 0
        document.querySelectorAll('.reveal').forEach(el => {
            gsap.fromTo(el, 
                { y: 30, opacity: 0 }, 
                {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power2.out",
                    overwrite: "auto"
                }
            );
        });

        // Parallax Effect
        document.querySelectorAll('.stats-image, .media-box img, .contact-image').forEach(img => {
            gsap.fromTo(img, 
                { y: "-15%" }, 
                { 
                    y: "15%", 
                    ease: "none",
                    scrollTrigger: {
                        trigger: img.parentElement,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );
        });
    }


    initInteractive() {
        const cursor = document.querySelector('.cursor');
        if (!cursor) return;
        window.addEventListener('mousemove', (e) => {
            if (typeof gsap !== 'undefined') {
                gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
            }
        });
        document.querySelectorAll('a, button, .gallery-item, .media-box').forEach(link => {
            link.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%, -50%) scale(5)');
            link.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%, -50%) scale(1)');
        });
    }

    tryInitStatsParticles() {
        const canvas = document.querySelector('#particles-stats');
        if (!canvas || typeof THREE === 'undefined') return;
        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(800 * 3);
            for(let i=0; i<800*3; i++) pos[i] = (Math.random()-0.5)*12;
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.4 });
            const points = new THREE.Points(geo, mat);
            scene.add(points);
            camera.position.z = 6;
            const anim = () => {
                requestAnimationFrame(anim);
                points.rotation.y += 0.001;
                points.rotation.x += 0.0005;
                renderer.render(scene, camera);
            };
            anim();
        } catch (e) { console.error(e); }
    }

    initOverlays() {
        const bioOverlay = document.querySelector('.bio-overlay');
        const bioOpenBtns = document.querySelectorAll('.btn-open-bio');
        const bioCloseBtn = document.querySelector('.btn-close-bio');

        const contactOverlay = document.querySelector('.contact-overlay');
        const contactOpenBtns = document.querySelectorAll('.btn-open-contact');
        const contactCloseBtn = document.querySelector('.btn-close-contact');

        const lockScroll = (lock) => {
            document.body.style.overflow = lock ? 'hidden' : '';
        };

        // Bio Events
        if (bioOverlay && bioCloseBtn) {
            bioOpenBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    bioOverlay.classList.add('active');
                    lockScroll(true);
                });
            });
            bioCloseBtn.addEventListener('click', () => {
                bioOverlay.classList.remove('active');
                lockScroll(false);
            });
        }

        // Contact Events
        if (contactOverlay && contactCloseBtn) {
            contactOpenBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    contactOverlay.classList.add('active');
                    lockScroll(true);
                    // If opening contact from bio, maybe close bio?
                    if (bioOverlay) bioOverlay.classList.remove('active');
                });
            });
            contactCloseBtn.addEventListener('click', () => {
                contactOverlay.classList.remove('active');
                lockScroll(false);
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (bioOverlay) bioOverlay.classList.remove('active');
                if (contactOverlay) contactOverlay.classList.remove('active');
                lockScroll(false);
            }
        });
    }
}

// Ensure startup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AntonellaApp());
} else {
    new AntonellaApp();
}

// ============================================================
// PortfolioExpand — despliega/colapsa items por sección
// ============================================================
class PortfolioExpand {
    constructor() {
        document.querySelectorAll('.portfolio-grid[data-limit]').forEach(grid => {
            this._init(grid);
        });
    }

    _init(grid) {
        const limit   = parseInt(grid.dataset.limit, 10);
        const items   = Array.from(grid.querySelectorAll('.portfolio-item'));
        const total   = items.length;
        const hidden  = items.slice(limit);
        const section = grid.closest('.portfolio-section');
        const btn     = section ? section.querySelector('.portfolio-toggle') : null;

        // Actualizar contador en el botón
        if (btn) {
            const countEl = btn.querySelector('.toggle-count');
            if (countEl && total > limit) {
                countEl.textContent = `+${total - limit}`;
            }
            // Ocultar botón si no hay más items
            if (total <= limit) {
                btn.closest('.portfolio-expand-bar').style.display = 'none';
            }
        }

        // Ocultar items que superan el límite
        hidden.forEach(item => item.classList.add('is-hidden'));

        if (!btn || total <= limit) return;

        let expanded = false;

        btn.addEventListener('click', () => {
            expanded = !expanded;

            if (expanded) {
                // Revelar con stagger
                hidden.forEach((item, i) => {
                    item.classList.remove('is-hidden');
                    item.style.animationDelay = `${i * 60}ms`;
                    item.classList.add('is-revealing');
                    item.addEventListener('animationend', () => {
                        item.classList.remove('is-revealing');
                        item.style.animationDelay = '';
                    }, { once: true });
                });

                btn.querySelector('.toggle-label').textContent = 'COLAPSAR';
                btn.querySelector('.toggle-count').textContent = '';
                btn.classList.add('is-expanded');
            } else {
                // Colapsar: scroll suave al inicio de la sección antes de ocultar
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                    hidden.forEach(item => item.classList.add('is-hidden'));
                    btn.querySelector('.toggle-label').textContent = 'VER TODOS';
                    btn.querySelector('.toggle-count').textContent = `+${total - limit}`;
                    btn.classList.remove('is-expanded');
                }, 500);
            }
        });
    }
}

new PortfolioExpand();
