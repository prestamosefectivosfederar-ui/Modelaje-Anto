// Antonella Portfolio - Lusion.co Style Portrait Particle Effect
class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.cw = canvasWidth;
        this.ch = canvasHeight;
        this.targetX = null;
        this.targetY = null;
        this.isPortrait = false;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.cw;
        this.y = Math.random() * this.ch;
        this.vx = 0;
        this.vy = 0;
        this.speed = 0.7 + Math.random() * 0.8;
        const alpha = 0.5 + Math.random() * 0.4;
        const rg = 160 + Math.floor(Math.random() * 60);
        const b = 210 + Math.floor(Math.random() * 45);
        this.color = `rgba(${rg},${rg + 15},${b},${alpha})`;
    }

    update(flowAngle, mouseX, mouseY) {
        if (this.isPortrait && this.targetX !== null) {
            // Spring attraction toward portrait feature point
            this.vx += (this.targetX - this.x) * 0.004;
            this.vy += (this.targetY - this.y) * 0.004;
            // Subtle flow field noise for organic movement
            this.vx += Math.cos(flowAngle) * 0.015;
            this.vy += Math.sin(flowAngle) * 0.015;
        } else {
            // Ambient particles: full flow field guidance
            this.vx += Math.cos(flowAngle) * 0.05;
            this.vy += Math.sin(flowAngle) * 0.05;
        }

        // Mouse repulsion — stronger for portrait particles so face "explodes"
        if (mouseX !== null) {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distSq = dx * dx + dy * dy;
            const radius = 160;
            if (distSq < radius * radius && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const force = (1 - dist / radius) * (this.isPortrait ? 5.0 : 3.0);
                this.vx += (dx / dist) * force * 0.12;
                this.vy += (dy / dist) * force * 0.12;
            }
        }

        this.vx *= 0.94;
        this.vy *= 0.94;
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;

        // Portrait particles spring back; ambient ones reset when out of bounds
        if (!this.isPortrait) {
            if (this.x < -5 || this.x > this.cw + 5 || this.y < -5 || this.y > this.ch + 5) {
                this.reset();
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.isPortrait ? 1.4 : 1.0, 0, Math.PI * 2);
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
        const heroTitle = document.querySelector('.split-text');
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

        const PARTICLE_COUNT = 1200;
        const CELL_SIZE = 20;
        const PORTRAIT_RATIO = 0.72; // 72% of particles form the portrait

        let particles = [];
        let flowField = [];
        let featurePoints = [];
        let portraitImg = null;
        let imgDrawParams = null; // cached draw coords for the portrait
        let mouseX = null;
        let mouseY = null;
        let rafId = null;
        let frameCount = 0;
        let cols = 0;
        let rows = 0;
        let sectionRect = null;

        // --- Image sampling ---
        const samplePortrait = (img) => {
            // Build an offscreen canvas at reduced resolution for sampling
            const SW = 400;
            const SH = Math.round(SW * (img.height / img.width));
            const off = document.createElement('canvas');
            off.width = SW;
            off.height = SH;
            const oCtx = off.getContext('2d');
            oCtx.drawImage(img, 0, 0, SW, SH);
            const data = oCtx.getImageData(0, 0, SW, SH).data;

            // Scale sample coords to real canvas coords (image is centered, cover-height)
            const scale = canvas.height / img.height;
            const dw = img.width * scale;
            const dx = (canvas.width - dw) / 2;
            imgDrawParams = { dx, dy: 0, dw, dh: canvas.height };

            featurePoints = [];
            const step = 4;
            for (let y = 0; y < SH; y += step) {
                for (let x = 0; x < SW; x += step) {
                    const i = (y * SW + x) * 4;
                    // Luminance
                    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    if (lum > 50) {
                        // Map sample coords → canvas coords
                        featurePoints.push({
                            x: dx + (x / SW) * dw,
                            y: (y / SH) * canvas.height,
                            w: lum / 255
                        });
                    }
                }
            }

            assignPortraitParticles();
        };

        const assignPortraitParticles = () => {
            if (featurePoints.length === 0) return;
            const portraitCount = Math.floor(PARTICLE_COUNT * PORTRAIT_RATIO);
            particles.forEach((p, i) => {
                if (i < portraitCount) {
                    const fp = featurePoints[Math.floor(Math.random() * featurePoints.length)];
                    p.isPortrait = true;
                    p.targetX = fp.x + (Math.random() - 0.5) * 6;
                    p.targetY = fp.y + (Math.random() - 0.5) * 6;
                    // Start scattered, spring into position
                    p.x = fp.x + (Math.random() - 0.5) * canvas.width * 0.6;
                    p.y = fp.y + (Math.random() - 0.5) * canvas.height * 0.4;
                } else {
                    p.isPortrait = false;
                    p.targetX = null;
                    p.targetY = null;
                }
            });
        };

        // --- Load portrait ---
        const img = new Image();
        img.src = 'about_model.png';
        img.onload = () => {
            portraitImg = img;
            if (particles.length > 0) samplePortrait(img);
        };

        // --- Flow field ---
        const buildFlowField = () => {
            const t = frameCount * 0.001;
            for (let r = 0; r < rows; r++) {
                if (!flowField[r]) flowField[r] = new Float32Array(cols);
                for (let c = 0; c < cols; c++) {
                    flowField[r][c] =
                        Math.sin(c * 0.1 + t) *
                        Math.cos(r * 0.1 + t * 0.7) *
                        Math.PI * 4;
                }
            }
        };

        // --- Resize ---
        const resize = () => {
            canvas.width = section.offsetWidth;
            canvas.height = section.offsetHeight;
            sectionRect = section.getBoundingClientRect();
            cols = Math.ceil(canvas.width / CELL_SIZE);
            rows = Math.ceil(canvas.height / CELL_SIZE);
            flowField = [];
            buildFlowField();
            particles = Array.from(
                { length: PARTICLE_COUNT },
                () => new Particle(canvas.width, canvas.height)
            );
            if (portraitImg) samplePortrait(portraitImg);
        };

        // --- Render loop ---
        const loop = () => {
            rafId = requestAnimationFrame(loop);
            frameCount = (frameCount + 1) % 120;
            if (frameCount === 0) buildFlowField();

            // 1. Fade trail
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Ghost portrait at very low opacity (face silhouette)
            if (portraitImg && imgDrawParams) {
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 0.04;
                ctx.drawImage(portraitImg, imgDrawParams.dx, imgDrawParams.dy, imgDrawParams.dw, imgDrawParams.dh);
                ctx.globalAlpha = 1;
            }

            // 3. Particles with additive glow
            ctx.globalCompositeOperation = 'screen';
            particles.forEach(p => {
                const col = Math.min(Math.floor(p.x / CELL_SIZE), cols - 1);
                const row = Math.min(Math.floor(p.y / CELL_SIZE), rows - 1);
                const angle = (flowField[row] && flowField[row][col] !== undefined)
                    ? flowField[row][col] : 0;
                p.update(angle, mouseX, mouseY);
                p.draw(ctx);
            });
        };

        // --- Mouse ---
        section.addEventListener('mousemove', (e) => {
            mouseX = e.clientX - (sectionRect ? sectionRect.left : section.getBoundingClientRect().left);
            mouseY = e.clientY - (sectionRect ? sectionRect.top : section.getBoundingClientRect().top);
        });
        section.addEventListener('mouseleave', () => { mouseX = null; mouseY = null; });

        // --- Resize debounce ---
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { resize(); sectionRect = section.getBoundingClientRect(); }, 200);
        });

        // --- IntersectionObserver: defer init until visible ---
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
