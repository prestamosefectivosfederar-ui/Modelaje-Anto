# Lusion Effects — Design Spec
**Date:** 2026-04-11  
**Project:** Antonella Dimenza Portfolio  
**Stack:** HTML · CSS · Vanilla JS · GSAP 3 · Lenis · Three.js (already installed)

---

## Objetivo

Aplicar efectos visuales avanzados inspirados en Lusion.co al portfolio existente, sin añadir dependencias nuevas. El resultado debe sentirse cinematográfico y de alta moda.

---

## 1. Hero — Centrado Cinemático (Opción B)

### Layout
- Retrato (`about_model.jpeg`) posicionado a la derecha, `clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)` para corte diagonal
- Gradiente `linear-gradient(to right, #050505 50%, transparent 100%)` sobre el retrato para disolver hacia la izquierda
- Contenido de texto a la izquierda, sobre el gradiente

### Tipografía
- Eyebrow: `/ MODELO DE ALTA COSTURA` — color dorado `#c8a96e`, 0.7rem, letter-spacing 0.25em
- Nombre: `ANTONELLA` (blanco) + `DIMENZA` (outline dorado `-webkit-text-stroke: 1.5px #c8a96e; color: transparent`)
- Tamaño: `clamp(3rem, 8vw, 7rem)`, font-weight 900, line-height 0.88

### Reveal al cargar (GSAP)
- Cada letra del nombre se anima individualmente: `y: 110% → 0`, opacity 0→1
- Stagger: 0.04s por carácter, delay total tras el loader
- Eyebrow y subtexto entran después con fade+slide

### Partículas Three.js
- Canvas `position: absolute` sobre todo el hero, `pointer-events: none`, `z-index: 2`
- ~300 partículas `THREE.Points` con `ShaderMaterial` GLSL custom
- Vertex shader: posición + desplazamiento sinusoidal por tiempo
- Fragment shader: círculos suaves con alpha degradado hacia los bordes
- Interacción: mouse uniform pasado al shader → partículas cercanas se alejan (radio 120px, fuerza 0.8)
- Líneas de conexión: segundo pass con `THREE.LineSegments` para pares con distancia < 80px

### Detalles adicionales
- Línea divisora dorada animada (scaleX 0→1 al cargar)
- Indicador de scroll: línea vertical pulsante + texto "SCROLL"
- Botón CTA con cursor magnético (ver sección 3)

---

## 2. Cursor Magnético

### Comportamiento
- Radio de detección: 80px desde el centro del elemento
- Cuando el cursor entra al radio: el elemento se traslada hacia el cursor con `gsap.to(el, { x, y, duration: 0.4, ease: "power2.out" })`
- Desplazamiento máximo: 30% del tamaño del elemento
- Al salir del radio: retorno suave a posición original `{ x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" }`

### Elementos afectados
- Todos los `<button>` del sitio
- Todos los `<a>` del nav y overlays
- Cursor `.cursor` existente: se escala a 2x al entrar en zona magnética

### Implementación
- Clase `MagneticElement` en `main.js`
- `mousemove` global → itera sobre todos los elementos registrados
- Usa `getBoundingClientRect()` para calcular distancia

---

## 3. Tilt 3D en Hover

### Comportamiento
- Al entrar el mouse: `perspective: 800px` activo
- Seguimiento: `rotateX` y `rotateY` máx ±15° proporcional a posición del cursor dentro del elemento
- Highlight de luz: pseudo-elemento `::after` con `radial-gradient` que sigue al cursor (opacity 0→0.3)
- Al salir: retorno suave a `rotateX(0) rotateY(0)` con `ease: "power3.out"`

### Elementos afectados
- Imágenes de la galería horizontal (`.gallery-h-item`)
- Tarjetas de servicios (`.service-item`)

### Implementación
- Clase `TiltEffect` en `main.js`
- `mouseenter / mousemove / mouseleave` por elemento
- GSAP `to()` para suavizado

---

## 4. Galería Scroll Horizontal

### Estructura HTML
Reemplaza la sección `.gallery` existente:
```html
<section class="gallery-horizontal">
  <div class="gallery-track">
    <!-- 8 items -->
    <div class="gallery-h-item">
      <div class="gallery-h-img-wrap">
        <img src="[placeholder]" alt="...">
        <canvas class="displacement-canvas"></canvas>
      </div>
      <div class="gallery-h-info">
        <span>01</span>
        <p>Editorial</p>
      </div>
    </div>
    <!-- ... -->
  </div>
  <div class="gallery-progress">
    <span class="gallery-current">01</span>
    <div class="gallery-bar"><div class="gallery-bar-fill"></div></div>
    <span class="gallery-total">08</span>
  </div>
</section>
```

### Imágenes placeholder (Unsplash — estética fashion)
8 imágenes de moda de alta calidad de Unsplash con parámetros `?q=80&w=800`.

### Scroll horizontal (GSAP ScrollTrigger)
- `ScrollTrigger.create({ pin: true, scrub: 1 })` sobre `.gallery-horizontal`
- La pista (`.gallery-track`) se traslada en X de `0` a `-(trackWidth - viewportWidth)`
- Velocidad de scrub: 1 (suave)
- Contador `01/08` actualizado en tiempo real con `onUpdate`

### Displacement Hover (WebGL)
- Por cada imagen: un `<canvas>` superpuesto con WebGL
- Shader de displacement: deforma las coordenadas UV con una textura de ruido + posición del mouse
- Al hover: `uniforme uIntensity` sube de 0→0.08 con GSAP
- Al salir: baja a 0
- Textura de displacement: ruido Perlin generado proceduralmente (32x32px, sin dependencia externa)

---

## 5. Archivos a modificar

| Archivo | Cambios |
|---|---|
| `index.html` | Reestructurar `.hero`, reemplazar `.gallery`, añadir canvas de partículas |
| `style.css` | Estilos nuevos para hero-b, galería horizontal, tilt, displament overlay |
| `main.js` | 5 nuevas clases: `FluidParticles`, `MagneticElement`, `TiltEffect`, `HorizontalGallery`, `DisplacementHover` |

**No se modifican:** overlays de bio y contacto, marquee, sección de servicios (solo se agrega tilt), footer, loader.

---

## 6. Consideraciones técnicas

- Todos los efectos WebGL degradan graciosamente si el contexto no está disponible
- `requestAnimationFrame` compartido entre `FluidParticles` y `DisplacementHover` para no crear loops duplicados
- Lenis + ScrollTrigger ya están integrados — no requiere nueva configuración
- Shaders GLSL como template literals en `main.js` (sin archivos `.glsl` separados)
