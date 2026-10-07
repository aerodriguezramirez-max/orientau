// ============================================================
//  OrientaU — Mapa 3D de universidades (Colombia)
//  Carga el modelo mapacolombiacc.glb y ubica cada universidad
//  en su posición real, usando sus coordenadas lat/lng.
// ============================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── Calibración geográfica → posición en el modelo 3D ─────────
// Si al probarlo el mapa se ve espejado (invertido), cambiar
// FLIP_X o FLIP_Y de 1 a -1 — es el único ajuste que debería hacer falta.
const FLIP_X = 1;
const FLIP_Y = 1;

const LAT_MIN = -4.23, LAT_MAX = 12.46;   // sur (Leticia) a norte (Punta Gallinas)
const LON_MIN = -79.03, LON_MAX = -66.85; // oeste (Pacífico) a este (Guainía)
const MESH_Y_MIN = 0.00002, MESH_Y_MAX = 1.13127;
const MESH_X_MIN = -0.39276, MESH_X_MAX = 0.41904;
const MESH_Z_FRONT = 0.05426;

function geoToMesh(lat, lon) {
  let ty = (lat - LAT_MIN) / (LAT_MAX - LAT_MIN);
  let tx = (lon - LON_MIN) / (LON_MAX - LON_MIN);
  if (FLIP_X < 0) tx = 1 - tx;
  if (FLIP_Y < 0) ty = 1 - ty;
  const y = MESH_Y_MIN + ty * (MESH_Y_MAX - MESH_Y_MIN);
  const x = MESH_X_MIN + tx * (MESH_X_MAX - MESH_X_MIN);
  return [x, y, MESH_Z_FRONT];
}

// ── Estado del visor ────────────────────────────────────────
let scene, camera, renderer, controls, modelGroup;
let initialized = false;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const markerMeshes = [];

export function initMapa3D(containerId) {
  if (initialized) return;
  const container = document.getElementById(containerId);
  if (!container) return;
  initialized = true;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a12);
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 100);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.3;
  controls.maxDistance = 6;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.0); d1.position.set(3, 5, 4); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x88aaff, 0.5); d2.position.set(-4, 2, -3); scene.add(d2);
  const d3 = new THREE.DirectionalLight(0xffffff, 0.4); d3.position.set(0, -3, 2); scene.add(d3);

  const loader = new GLTFLoader();
  loader.load(
    'mapacolombiacc.glb',
    (gltf) => {
      modelGroup = gltf.scene;
      scene.add(modelGroup);

      const box = new THREE.Box3().setFromObject(modelGroup);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      modelGroup.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      camera.position.set(maxDim * 0.15, maxDim * 0.9, maxDim * 1.6);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();

      colocarMarcadores(modelGroup);
      ocultarCargando(containerId);
    },
    undefined,
    () => { mostrarError(containerId, 'No se pudo cargar el mapa 3D.'); }
  );

  renderer.domElement.addEventListener('click', (ev) => onPointerUp(ev, containerId));
  renderer.domElement.addEventListener('touchend', (ev) => {
    if (ev.changedTouches && ev.changedTouches[0]) onPointerUp(ev.changedTouches[0], containerId);
  });
  window.addEventListener('resize', () => onResize(container));

  animate();
}

function colocarMarcadores(group) {
  const unis = window.UNIVERSITIES || [];
  const coordsMap = window.UNI_COORDS || {};
  const textureLoader = new THREE.TextureLoader();

  unis.forEach((u) => {
    const coords = coordsMap[u.name];
    if (!coords) return;
    const [x, y, z] = geoToMesh(coords[0], coords[1]);

    let marker;
    if (u.logo) {
      const mat = new THREE.SpriteMaterial({ depthTest: false, transparent: true });
      marker = new THREE.Sprite(mat);
      marker.scale.set(0.035, 0.035, 1);
      textureLoader.load(
        u.logo,
        (tex) => { mat.map = tex; mat.needsUpdate = true; },
        undefined,
        () => { /* si el logo falla, se queda como punto chico por el material base */ }
      );
    } else {
      const geo = new THREE.SphereGeometry(0.005, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: 0x4f8ef7 });
      marker = new THREE.Mesh(geo, mat);
    }
    marker.position.set(x, y, z);
    marker.userData.uni = u;
    group.add(marker);
    markerMeshes.push(marker);
  });
}

function onPointerUp(ev, containerId) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(markerMeshes);
  if (hits.length) mostrarPopup(containerId, hits[0].object.userData.uni);
}

function mostrarPopup(containerId, u) {
  const container = document.getElementById(containerId);
  let pop = document.getElementById('mapa3dPopup');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'mapa3dPopup';
    pop.style.cssText = 'position:absolute;bottom:14px;left:50%;transform:translateX(-50%);'
      + 'background:rgba(15,15,25,.92);border:1px solid rgba(255,255,255,.15);border-radius:12px;'
      + 'padding:10px 16px;color:#fff;font-size:14px;max-width:85%;text-align:center;z-index:5;';
    container.appendChild(pop);
  }
  pop.innerHTML = `<strong>${u.icon || ''} ${u.name}</strong><br><span style="color:#aaa;font-size:12px;">${u.city || ''}</span>`;
}

function onResize(container) {
  if (!camera || !renderer) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function ocultarCargando(containerId) {
  const el = document.querySelector(`#${containerId} .mapa3d-loading`);
  if (el) el.style.display = 'none';
}
function mostrarError(containerId, msg) {
  const el = document.querySelector(`#${containerId} .mapa3d-loading`);
  if (el) el.textContent = msg;
}

window.initMapa3D = initMapa3D;
