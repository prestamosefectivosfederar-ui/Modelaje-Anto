// Antonella Portfolio - Lusion.co Portrait Particle System
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.targetX = 0;
        this.targetY = 0;
        // Randomize color: white, cold-blue, cyan
        const t = Math.random();
        const a = 0.55 + Math.random() * 0.45;
        if (t < 0.45) {
            const v = 210 + Math.floor(Math.random() * 45);
            this.color = `rgba(${v},${v},255,${a})`;
        } else if (t < 0.75) {
            this.color = `rgba(120,210,255,${a})`;
        } else {
            this.color = `rgba(255,255,255,${a})`;
        }
        this.r = 1.2 + Math.random() * 1.4;
    }

    setTarget(tx, ty, cw, ch) {
        this.targetX = tx;
        this.targetY = ty;
        // Scatter from a random position so particles fly into formation
        this.x = Math.random() * cw;
        this.y = Math.random() * ch;
        this.vx = 0;
        this.vy = 0;
    }

    update(noiseX, noiseY, mouseX, mouseY) {
        // Strong spring toward target — this is what forms the face
        this.vx += (this.targetX - this.x) * 0.09;
        this.vy += (this.targetY - this.y) * 0.09;

        // Tiny organic noise so particles breathe slightly
        this.vx += noiseX * 0.4;
        this.vy += noiseY * 0.4;

        // Mouse repulsion — face explodes on hover
        if (mouseX !== null) {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distSq = dx * dx + dy * dy;
            const R = 190;
            if (distSq < R * R && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const f = (1 - dist / R) * 9.0;
                this.vx += (dx / dist) * f * 0.18;
                this.vy += (dy / dist) * f * 0.18;
            }
        }

        // Heavy damping: particles settle fast
        this.vx *= 0.82;
        this.vy *= 0.82;
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

class AntonellaApp {
    constructor() {
        this.initLenis();
        this.initLoader();
        this.initGSAP();
        this.initInteractive();
        this.initAboutCanvas();
    }

    initLenis() {
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            this.lenis.raf(time);
            requestAnimationFrame(raf.bind(this));
        }
        requestAnimationFrame(raf.bind(this));

        // Sync scrollTrigger with Lenis
        this.lenis.on('scroll', ScrollTrigger.update);
    }

    initLoader() {
        const loaderPercent = document.querySelector('.loader-percent');
        const loaderProgress = document.querySelector('.loader-progress');
        const loader = document.querySelector('#loader');
        let percentage = 0;

        const interval = setInterval(() => {
            percentage += Math.floor(Math.random() * 10) + 1;
            if (percentage >= 100) {
                percentage = 100;
                clearInterval(interval);
                this.revealPage(loader);
            }
            if (loaderPercent) loaderPercent.innerText = percentage.toString().padStart(2, '0');
            if (loaderProgress) loaderProgress.style.width = percentage + '%';
        }, 30);
    }

    revealPage(loader) {
        gsap.to(loader, {
            yPercent: -100,
            duration: 1.5,
            ease: "expo.inOut",
            onComplete: () => {
                document.body.classList.remove('loading');
                loader.style.display = 'none';
                this.animateHero();
            }
        });
    }

    animateHero() {
        const heroSub = document.querySelector('.hero-subtext');
        const heroImg = document.querySelector('.hero-image-container');

        const tl = gsap.timeline();
        
        tl.from(heroImg, {
            scale: 1.2,
            filter: "blur(20px)",
            duration: 2,
            ease: "expo.out"
        }, 0);

        tl.from(".split-text", {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power4.out"
        }, 0.5);

        tl.from(heroSub, {
            y: 20,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        }, 1);
    }

    initGSAP() {
        gsap.registerPlugin(ScrollTrigger);

        // Image Parallax & Reveal Effect
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const images = section.querySelectorAll('img');
            
            images.forEach(img => {
                // Wrap image in a container if it's not already
                const parent = img.parentElement;
                
                gsap.fromTo(img, 
                    { y: -50, scale: 1.1 }, 
                    { 
                        y: 50, 
                        scale: 1,
                        ease: "none",
                        scrollTrigger: {
                            trigger: parent,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );
            });
        });

        // Text Scramble / Character Reveal (Simplified for basic text)
        const revealTexts = document.querySelectorAll('.ultra-title, .about-info-block h3, .stat-value');
        revealTexts.forEach(text => {
            gsap.from(text, {
                scrollTrigger: {
                    trigger: text,
                    start: "top 90%",
                },
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: "expo.out"
            });
        });
    }

    initInteractive() {
        const cursor = document.querySelector('.cursor');
        const links = document.querySelectorAll('a, button, .gallery-item, .media-box, .btn-archive');

        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.2,
                ease: "power2.out"
            });
        });

        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(cursor, { 
                    scale: 6, 
                    backgroundColor: "rgba(255,255,255,0.1)", 
                    border: "1px solid rgba(255,255,255,0.2)",
                    mixBlendMode: "difference",
                    duration: 0.3 
                });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(cursor, { 
                    scale: 1, 
                    backgroundColor: "white", 
                    border: "none",
                    mixBlendMode: "normal",
                    duration: 0.3 
                });
            });
        });

        // Marquee Smooth Speed Control
        const marquee = document.querySelector('.marquee-content');
        if (marquee) {
            this.lenis.on('scroll', (e) => {
                const speed = 1 + Math.abs(e.velocity) * 0.05;
                gsap.to(marquee, { timeScale: speed, duration: 0.5 });
            });
        }
    }

    initAboutCanvas() {
        const section = document.querySelector('.about-stitch');
        const canvas = document.getElementById('about-canvas');
        if (!canvas || !section) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // ~2500 particles, all forming the face
        const PARTICLE_COUNT = 2500;
        // Noise grid for organic breathing
        const CELL = 30;

        let particles = [];
        let noiseField = []; // {nx, ny} per cell — tiny displacement vectors
        let mouseX = null;
        let mouseY = null;
        let rafId = null;
        let frameCount = 0;
        let cols = 0;
        let rows = 0;
        let sectionRect = null;
        let portraitImg = null;

        // --- Noise field (slow-drifting displacement vectors) ---
        const buildNoise = () => {
            const t = frameCount * 0.0008;
            for (let r = 0; r < rows; r++) {
                if (!noiseField[r]) noiseField[r] = [];
                for (let c = 0; c < cols; c++) {
                    const a = Math.sin(c * 0.15 + t) * Math.cos(r * 0.15 + t * 0.6) * Math.PI * 2;
                    noiseField[r][c] = { nx: Math.cos(a) * 0.012, ny: Math.sin(a) * 0.012 };
                }
            }
        };

        // --- Fallback: distribute particles in a portrait-shaped oval ---
        const assignOvalFallback = () => {
            const cx = canvas.width * 0.5;
            const cy = canvas.height * 0.38;
            const rx = canvas.width  * 0.18;
            const ry = canvas.height * 0.32;
            particles.forEach(p => {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random());
                p.setTarget(
                    cx + Math.cos(angle) * rx * r,
                    cy + Math.sin(angle) * ry * r,
                    canvas.width, canvas.height
                );
            });
            console.warn('[portrait] Using oval fallback — serve from localhost to enable pixel sampling.');
        };

        // --- Sample image → assign one feature point per particle ---
        const assignFromImage = (img) => {
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.88;
            const dw = img.width  * scale;
            const dh = img.height * scale;
            const dx = (canvas.width  - dw) / 2;
            const dy = (canvas.height - dh) / 2;

            const SW = Math.round(Math.min(dw, 500));
            const SH = Math.round(Math.min(dh, 700));
            const off = document.createElement('canvas');
            off.width = SW; off.height = SH;
            const oCtx = off.getContext('2d');
            oCtx.drawImage(img, 0, 0, SW, SH);

            let data;
            try {
                data = oCtx.getImageData(0, 0, SW, SH).data;
            } catch (e) {
                // SecurityError on file:// — use fallback
                console.warn('[portrait] getImageData blocked (file:// protocol?). Using oval fallback.', e);
                assignOvalFallback();
                return;
            }

            const candidates = [];
            const step = 3;
            for (let y = 0; y < SH; y += step) {
                for (let x = 0; x < SW; x += step) {
                    const i = (y * SW + x) * 4;
                    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    if (lum > 35) {
                        candidates.push({
                            x: dx + (x / SW) * dw,
                            y: dy + (y / SH) * dh,
                            w: lum
                        });
                    }
                }
            }

            if (candidates.length < 10) {
                console.warn('[portrait] Not enough bright pixels — using oval fallback.');
                assignOvalFallback();
                return;
            }

            const pool = [];
            const maxW = Math.max(...candidates.map(c => c.w));
            for (const c of candidates) {
                const reps = Math.max(1, Math.round((c.w / maxW) * 4));
                for (let k = 0; k < reps; k++) pool.push(c);
            }

            particles.forEach(p => {
                const fp = pool[Math.floor(Math.random() * pool.length)];
                p.setTarget(
                    fp.x + (Math.random() - 0.5) * step * 1.5,
                    fp.y + (Math.random() - 0.5) * step * 1.5,
                    canvas.width, canvas.height
                );
            });
            console.log(`[portrait] Sampled ${candidates.length} candidates → ${pool.length} weighted targets.`);
        };

        // --- Load portrait image ---
        const img = new Image();
        img.src = 'about_model.png';
        img.onerror = () => {
            console.warn('[portrait] about_model.png failed to load. Using oval fallback.');
            if (particles.length > 0) assignOvalFallback();
        };
        img.onload = () => {
            portraitImg = img;
            if (particles.length > 0) assignFromImage(img);
        };

        // --- Resize ---
        const resize = () => {
            canvas.width  = section.offsetWidth;
            canvas.height = section.offsetHeight;
            sectionRect   = section.getBoundingClientRect();
            cols = Math.ceil(canvas.width  / CELL);
            rows = Math.ceil(canvas.height / CELL);
            noiseField = [];
            buildNoise();
            particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
            if (portraitImg) assignFromImage(portraitImg);
        };

        // --- Render loop ---
        const loop = () => {
            rafId = requestAnimationFrame(loop);
            frameCount = (frameCount + 1) % 180;
            if (frameCount === 0) buildNoise();

            // Fade trail
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(0,0,0,0.07)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw particles with screen blending (glow/bloom)
            ctx.globalCompositeOperation = 'screen';
            particles.forEach(p => {
                const col = Math.min(Math.floor(p.x / CELL), cols - 1);
                const row = Math.min(Math.floor(p.y / CELL), rows - 1);
                const n   = (noiseField[row] && noiseField[row][col]) || { nx: 0, ny: 0 };
                p.update(n.nx, n.ny, mouseX, mouseY);
                p.draw(ctx);
            });
        };

        // Fill canvas black immediately so it doesn't flicker transparent
        const initCanvas = () => {
            canvas.width  = section.offsetWidth  || window.innerWidth;
            canvas.height = section.offsetHeight || window.innerHeight;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        initCanvas();

        // --- Mouse ---
        section.addEventListener('mousemove', (e) => {
            const r = sectionRect || section.getBoundingClientRect();
            mouseX = e.clientX - r.left;
            mouseY = e.clientY - r.top;
        });
        section.addEventListener('mouseleave', () => { mouseX = null; mouseY = null; });

        // --- Resize debounce ---
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                sectionRect = section.getBoundingClientRect();
            }, 200);
        });

        // --- IntersectionObserver: defer init until section visible ---
        let initialized = false;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!initialized) { initialized = true; resize(); }
                if (!rafId) loop();
            } else {
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            }
        }, { threshold: 0.05 });

        observer.observe(section);
    }
}

// Initializing the Premium Experience
window.onload = () => {
    new AntonellaApp();
};
