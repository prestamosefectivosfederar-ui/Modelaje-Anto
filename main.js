// Antonella Portfolio - Lusion.co Style Experience
// Resilient Version - Handling external libraries gracefully

class AntonellaApp {
    constructor() {
        console.log('AntonellaApp: Initializing...');
        this.initLoader();
        
        // Use a small delay to ensure CDNs are parsed
        setTimeout(() => {
            this.tryInitLenis();
            this.initGSAP();
            this.initInteractive();
            this.tryInitStatsParticles();
            this.initFilmGrain();
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
        const tl = gsap.timeline();
        // Ensure elements are visible by using fromTo
        tl.fromTo(".hero-image-container", { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 0.3, duration: 2, ease: "expo.out" }, 0);
        tl.fromTo(".clipped-title", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out" }, 0.5);
        tl.fromTo(".hero-subtext", { y: 20, opacity: 0 }, { y: 0, opacity: 0.7, duration: 1, ease: "power3.out" }, 1);
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
        document.querySelectorAll('.hero-image, .stats-image, .gallery-item img, .media-box img, .contact-image, .floating-portrait img').forEach(img => {
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
}

// Ensure startup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AntonellaApp());
} else {
    new AntonellaApp();
}
