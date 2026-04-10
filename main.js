import * as THREE from 'three';

class LusionApp {
    constructor() {
        this.container = document.querySelector('#canvas-webgl');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true
        });
        
        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);
        
        this.init();
        this.initLoader();
    }

    initLoader() {
        console.log('AntonellaApp: Iniciando cargador...');
        let percentage = 0;
        const loaderPercent = document.querySelector('.loader-percent');
        const loaderProgress = document.querySelector('.loader-progress');
        const loader = document.querySelector('#loader');

        if (!loader || !loaderPercent) {
            console.warn('AntonellaApp: Elementos del cargador no encontrados, saltando preloader.');
            document.body.classList.remove('loading');
            return;
        }

        const interval = setInterval(() => {
            percentage += Math.floor(Math.random() * 8) + 2;
            if (percentage >= 100) {
                percentage = 100;
                clearInterval(interval);
                setTimeout(() => {
                    loader.classList.add('loaded');
                    document.body.classList.remove('loading');
                    console.log('AntonellaApp: Cargador completo.');
                }, 500);
            }
            loaderPercent.innerText = percentage.toString().padStart(2, '0');
            if (loaderProgress) loaderProgress.style.width = percentage + '%';
        }, 50);

        // Fail-safe: Hide loader after 5 seconds if it gets stuck
        setTimeout(() => {
            if (document.body.classList.contains('loading')) {
                console.warn('AntonellaApp: Cargador trabado, forzando revelación.');
                loader.classList.add('loaded');
                document.body.classList.remove('loading');
                clearInterval(interval);
            }
        }, 5000);
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.camera.position.z = 3;

        // Create organic 3D background
        this.createMesh();
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x2E5BFF, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Events
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        this.animate();
        this.initCursor();
    }

    createMesh() {
        // A soft, organic sphere made of points/lines
        const geometry = new THREE.IcosahedronGeometry(1.5, 4);
        const material = new THREE.MeshPhongMaterial({
            color: 0x2E5BFF,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
            wireframeLinewidth: 1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Add some points for extra sparkle
        const pointsGeometry = new THREE.IcosahedronGeometry(1.55, 3);
        const pointsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.012
        });
        this.points = new THREE.Points(pointsGeometry, pointsMaterial);
        this.scene.add(this.points);
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Update custom cursor
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    }

    initCursor() {
        // Link hover effect
        const links = document.querySelectorAll('a, button');
        const cursor = document.querySelector('.cursor');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(4)';
                cursor.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                cursor.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            });
            link.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.backgroundColor = '#2E5BFF';
            });
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Smoothly interpolate mouse
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        
        // Rotate mesh based on mouse
        if (this.mesh) {
            this.mesh.rotation.y += 0.002;
            this.mesh.rotation.x += 0.001;
            
            this.mesh.rotation.y += this.mouse.x * 0.05;
            this.mesh.rotation.x += -this.mouse.y * 0.05;
        }

        if (this.points) {
            this.points.rotation.y -= 0.001;
            this.points.rotation.x -= 0.0005;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Wrap initialization to ensure DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    console.log('AntonellaApp: Inicializando...');
    try {
        new LusionApp();
    } catch (e) {
        console.error('AntonellaApp: Error al inicializar', e);
    }
});
