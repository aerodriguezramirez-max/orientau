/* ═══════════════════════════════════════════════════════════════
   model3d.js — OrientaU
   Carga el modelo 3D "Graduation Ascension" (Meshy AI) y lo monta
   dentro de un <canvas>. Reemplaza el logo plano pseudo-3D en el
   hero del dashboard y en el login. Se reusa el mismo módulo en
   ambas páginas para no duplicar lógica.
   ═══════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = 'assets/models/graduation-ascension.glb';

// Loader + promesa compartidos: si una página monta el modelo más de
// una vez, no se vuelve a descargar/parsear el archivo.
const loader = new GLTFLoader();
let gltfPromise = null;
function loadModel() {
  if (!gltfPromise) {
    const resolvedURL = new URL(MODEL_URL, document.baseURI).href;
    gltfPromise = fetch(MODEL_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} al pedir ${resolvedURL}`);
        }
        return res.arrayBuffer();
      })
      .then((buffer) => new Promise((resolve, reject) => {
        const basePath = resolvedURL.substring(0, resolvedURL.lastIndexOf('/') + 1);
        loader.parse(buffer, basePath, resolve, (err) => {
          reject(new Error(`GLTFLoader no pudo parsear el archivo: ${err && err.message ? err.message : err}`));
        });
      }))
      .catch((err) => {
        gltfPromise = null; // permite reintentar en la próxima llamada
        throw err;
      });
  }
  return gltfPromise;
}

/**
 * Monta el modelo 3D dentro de un <canvas>.
 *
 * @param {string} canvasId       id del <canvas> destino
 * @param {object} [opts]
 * @param {string} [opts.fallbackImgId] id del <img> a mostrar si WebGL
 *                                      o la carga del modelo fallan
 * @param {string} [opts.loaderId]      id del spinner a ocultar cuando
 *                                      el modelo ya esté listo
 * @param {number} [opts.rotateSpeed]   velocidad de rotación idle (rad/seg)
 * @param {number} [opts.fillFactor]    % del alto del canvas que debe
 *                                      ocupar el modelo (0–1)
 * @param {boolean} [opts.static]       si es true, renderiza un solo frame
 *                                      fijo (sin loop continuo). Ideal para
 *                                      íconos pequeños siempre visibles
 *                                      (ej. logo del navbar) donde animar
 *                                      sin parar sería gastar recursos de más.
 */
export function initHeroModel3D(canvasId, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const fallbackImg = opts.fallbackImgId ? document.getElementById(opts.fallbackImgId) : null;
  const loaderEl    = opts.loaderId ? document.getElementById(opts.loaderId) : null;
  const debugEl     = opts.debugId ? document.getElementById(opts.debugId) : null;
  const rotateSpeed = opts.rotateSpeed ?? 0.32;
  const fillFactor  = opts.fillFactor ?? 0.62;
  const isStatic    = !!opts.static;

  function showFallback(reason) {
    if (loaderEl) loaderEl.style.display = 'none';
    canvas.style.display = 'none';
    if (fallbackImg) fallbackImg.style.display = '';
    if (debugEl && reason) {
      debugEl.textContent = '⚠ Modelo 3D (' + canvasId + '): ' + reason;
      debugEl.style.display = '';
    }
    if (reason) console.error('OrientaU 3D [' + canvasId + ']:', reason);
  }

  if (!window.WebGLRenderingContext) { showFallback('WebGL no soportado en este navegador'); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    showFallback('no se pudo crear el contexto WebGL — ' + e.message);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  // ── Iluminación (paleta azul/violeta acorde a OrientaU) ──────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  scene.add(new THREE.HemisphereLight(0x6fa8ff, 0x140d24, 0.55));

  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(3, 4.5, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x8b5cf6, 1.6);
  rim.position.set(-4, 2, -3.5);
  scene.add(rim);

  const fillLight = new THREE.DirectionalLight(0x4f8ef7, 0.6);
  fillLight.position.set(-3, -1.5, 3.5);
  scene.add(fillLight);

  const group = new THREE.Group();
  group.rotation.y = Math.PI * 0.18; // pose inicial, no de frente
  scene.add(group);

  let modelReady = false;

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (isStatic && modelReady) renderer.render(scene, camera);
  }
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  loadModel().then((gltf) => {
    const model = gltf.scene.clone(true);

    // Centrar el modelo en el origen
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    group.add(model);

    // Encuadre ajustado por eje (más grande que usar la esfera 3D completa,
    // que deja demasiado margen vacío para una figura vertical). Como el
    // grupo solo rota en Y: el alto (Y) no cambia con la rotación, y el
    // "peor caso" horizontal es la diagonal del footprint X-Z.
    const halfV = Math.max(size.y / 2, 0.001);
    const halfH = Math.max(Math.sqrt((size.x / 2) ** 2 + (size.z / 2) ** 2), 0.001);
    const maxHalf = Math.max(halfV, halfH);

    const fovRad = camera.fov * Math.PI / 180;
    const distV = (halfV / fillFactor) / Math.tan(fovRad / 2);
    const distH = (halfH / fillFactor) / Math.tan(fovRad / 2); // aspect≈1 → mismo fov horizontal
    const dist = Math.max(distV, distH);

    camera.position.set(0, halfV * 0.08, dist);
    camera.near = Math.max(dist - maxHalf * 4, 0.05);
    camera.far  = dist + maxHalf * 4;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    modelReady = true;
    if (loaderEl) loaderEl.style.display = 'none';
    if (fallbackImg) fallbackImg.style.display = 'none';
    canvas.classList.add('is-ready');

    if (isStatic) {
      renderer.render(scene, camera);
    } else {
      const clock = new THREE.Clock();
      (function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += clock.getDelta() * rotateSpeed;
        renderer.render(scene, camera);
      })();
    }
  }).catch((err) => {
    showFallback((err && err.message) ? err.message : String(err));
  });
}

/* ── Auto-inicialización ──────────────────────────────────────────
   Cada página solo necesita <script type="module" src="model3d.js">
   en el <head>; este bloque detecta qué canvas hay en el DOM y lo
   monta con la config adecuada. Así no hay que repetir la llamada
   ni los ids en cada HTML. ──────────────────────────────────────── */
if (document.getElementById('heroLogo3D')) {
  initHeroModel3D('heroLogo3D', {
    fallbackImgId: 'heroLogoImg',
    loaderId: 'heroLogo3DLoader',
    debugId: 'heroLogo3DDebug',
    rotateSpeed: 0.30,
    fillFactor: 0.92
  });
}
if (document.getElementById('loginLogo3D')) {
  initHeroModel3D('loginLogo3D', {
    fallbackImgId: 'loginLogoImg',
    loaderId: 'loginLogo3DLoader',
    debugId: 'loginLogo3DDebug',
    rotateSpeed: 0.40,
    fillFactor: 0.92
  });
}
if (document.getElementById('navLogo3D')) {
  initHeroModel3D('navLogo3D', {
    fallbackImgId: 'navLogoImg',
    debugId: 'navLogo3DDebug',
    fillFactor: 0.90,
    static: true // ícono pequeño y siempre visible: un solo frame, sin loop
  });
}
