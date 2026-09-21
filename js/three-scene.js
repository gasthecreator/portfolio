import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const mqMobile = window.matchMedia('(max-width: 900px)');
const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
function isMobile() { return mqMobile.matches; }
function isReducedMotion() { return mqReduced.matches; }

function srgbEncode(c) {
  c = clamp(c, 0, 1);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
function oklchToThree(str) {
  const m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(str);
  if (!m) return new THREE.Color(0xffffff);
  const L = parseFloat(m[1]), C = parseFloat(m[2]), H = (parseFloat(m[3]) * Math.PI) / 180;
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, mm = m_ ** 3, s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * s;
  return new THREE.Color().setRGB(srgbEncode(r), srgbEncode(g), srgbEncode(bl), THREE.SRGBColorSpace);
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.3)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function makeGradientBackground() {
  const w = 512, h = 512;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, Math.hypot(w * 0.7, h * 0.75));
  g.addColorStop(0, COLOR.bgInner.getStyle());
  g.addColorStop(1, COLOR.fog.getStyle());
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const SKILL_CATEGORIES = window.SITE.skills;

let COLOR;
function initPalette() {
  COLOR = {
    hubNode: oklchToThree('oklch(0.82 0.14 68)'),
    node: oklchToThree('oklch(0.93 0.035 85)'),
    hubEdge: oklchToThree('oklch(0.86 0.13 68)'),
    edge: oklchToThree('oklch(0.5 0.07 265)'),
    heroEdge: oklchToThree('oklch(0.72 0.09 250)'),
    fog: oklchToThree('oklch(0.18 0.055 275)'),
    bgInner: oklchToThree('oklch(0.27 0.065 268)'),
    catNodes: ['oklch(0.84 0.13 72)', 'oklch(0.78 0.11 38)', 'oklch(0.76 0.09 240)', 'oklch(0.7 0.11 320)', 'oklch(0.93 0.04 90)'].map(oklchToThree),
  };
}

// ---------- skills cluster ----------
function createSkillsScene() {
  const canvas = document.getElementById('skills-canvas');
  const wrap = document.getElementById('skills-cluster-wrap');
  const labelsContainer = document.getElementById('skills-labels');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLOR.fog.getHex(), 620, 1700);
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 2000);
  camera.position.set(0, 0, 720);

  const group = new THREE.Group();
  scene.add(group);

  const skillFlat = [];
  SKILL_CATEGORIES.forEach((cat, ci) => cat.items.forEach((name) => skillFlat.push({ name, ci })));
  const SN = skillFlat.length, golden = Math.PI * (3 - Math.sqrt(5)), R = 175;
  const nodeGeo = new THREE.SphereGeometry(1, 10, 10);

  const nodes = skillFlat.map((item, i) => {
    const yFrac = SN > 1 ? 1 - (i / (SN - 1)) * 2 : 0;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - yFrac * yFrac));
    const theta = golden * i;
    const pos = new THREE.Vector3(Math.cos(theta) * radiusAtY * R * 1.55, yFrac * R * 0.95, Math.sin(theta) * radiusAtY * R);
    const mat = new THREE.MeshBasicMaterial({ color: COLOR.catNodes[item.ci], fog: true });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.scale.setScalar(3.4);
    mesh.position.copy(pos);
    group.add(mesh);
    const label = document.createElement('div');
    label.className = 'skill-label';
    label.textContent = item.name;
    labelsContainer.appendChild(label);
    return { name: item.name, mesh, label };
  });

  const spokePositions = new Float32Array(nodes.length * 2 * 3);
  const spokeGeo = new THREE.BufferGeometry();
  spokeGeo.setAttribute('position', new THREE.BufferAttribute(spokePositions, 3));
  const spokeMat = new THREE.LineBasicMaterial({ color: COLOR.heroEdge, transparent: true, opacity: 0.85, fog: true });
  const spokes = new THREE.LineSegments(spokeGeo, spokeMat);
  group.add(spokes);

  return { canvas, wrap, labelsContainer, renderer, scene, camera, group, nodes, spokeGeo };
}

function resizeSkills(sk) {
  const w = sk.wrap.clientWidth, h = sk.wrap.clientHeight;
  if (w === 0 || h === 0) return;
  sk.renderer.setSize(w, h, false);
  sk.camera.aspect = w / h;
  sk.camera.updateProjectionMatrix();
}

const _v = new THREE.Vector3();
function updateSkills(sk, state) {
  const reduced = isReducedMotion();
  const mobile = isMobile();
  const fullFX = !reduced && !mobile;
  const ambient = fullFX && !state.dragging ? state.ambientAngle : 0;
  const parX = fullFX ? state.parallax.x : 0, parY = fullFX ? state.parallax.y : 0;
  sk.group.rotation.y = state.rotY + ambient + parX;
  sk.group.rotation.x = clamp(state.rotX + parY, -1, 1);

  const spokeArr = sk.spokeGeo.attributes.position.array;
  sk.nodes.forEach((n, i) => {
    spokeArr[i * 6 + 0] = 0; spokeArr[i * 6 + 1] = 0; spokeArr[i * 6 + 2] = 0;
    spokeArr[i * 6 + 3] = n.mesh.position.x; spokeArr[i * 6 + 4] = n.mesh.position.y; spokeArr[i * 6 + 5] = n.mesh.position.z;
  });
  sk.spokeGeo.attributes.position.needsUpdate = true;

  sk.renderer.render(sk.scene, sk.camera);
  sk.group.updateMatrixWorld();

  const rect = sk.canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  const halfW = rect.width / 2, halfH = rect.height / 2;
  const projected = sk.nodes.map((n) => {
    _v.copy(n.mesh.position).applyMatrix4(sk.group.matrixWorld).project(sk.camera);
    return { n, sx: _v.x * halfW, sy: -_v.y * halfH, z: _v.z };
  });

  const estHalfW = (p) => (p.n.name.length * 6.3 + 30) / 2;
  const estHalfH = 15;
  for (let it = 0; it < 6; it++) {
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const a = projected[i], b = projected[j];
        const minDx = estHalfW(a) + estHalfW(b) + 6, minDy = estHalfH * 2 + 4;
        const dx = b.sx - a.sx, dy = b.sy - a.sy;
        const overlapX = minDx - Math.abs(dx), overlapY = minDy - Math.abs(dy);
        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY) {
            const push = (overlapX / 2) * (dx === 0 ? 1 : Math.sign(dx) || 1);
            a.sx -= push; b.sx += push;
          } else {
            const push = (overlapY / 2) * (dy === 0 ? 1 : Math.sign(dy) || 1);
            a.sy -= push; b.sy += push;
          }
        }
      }
    }
  }
  projected.forEach((p) => {
    const op = clamp(lerp(1, 0.7, (p.z + 1) / 2), 0.62, 1);
    p.n.label.style.transform = `translate(${(p.sx + halfW + 8).toFixed(1)}px, ${(p.sy + halfH - 9).toFixed(1)}px)`;
    p.n.label.style.opacity = op.toFixed(3);
  });

  document.getElementById('skills-hud-count').innerHTML = `STACK.VIS · ${sk.nodes.length} NODES / ${SKILL_CATEGORIES.length} CATEGORIES`;
}

// ---------- interactions + shared loop ----------
function initInteractions(sk, skillsState) {
  let dragCtx = null;

  sk.wrap.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragCtx = { x: e.clientX, y: e.clientY, rx: skillsState.rotX, ry: skillsState.rotY };
    skillsState.dragging = true;
    sk.canvas.classList.add('dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (dragCtx) {
      const dx = e.clientX - dragCtx.x, dy = e.clientY - dragCtx.y;
      skillsState.rotY = dragCtx.ry + dx * 0.01;
      skillsState.rotX = clamp(dragCtx.rx - dy * 0.01, -0.8, 0.8);
      return;
    }
    if (!isReducedMotion() && !isMobile()) {
      const r2 = sk.canvas.getBoundingClientRect();
      if (e.clientX >= r2.left && e.clientX <= r2.right && e.clientY >= r2.top && e.clientY <= r2.bottom) {
        const px2 = clamp((e.clientX - r2.left) / r2.width, 0, 1), py2 = clamp((e.clientY - r2.top) / r2.height, 0, 1);
        skillsState.parallax.targetX = (px2 - 0.5) * 0.5; skillsState.parallax.targetY = (py2 - 0.5) * 0.4;
      } else {
        skillsState.parallax.targetX = 0; skillsState.parallax.targetY = 0;
      }
    }
  });
  window.addEventListener('pointerup', () => {
    if (!dragCtx) return;
    dragCtx = null;
    skillsState.dragging = false;
    sk.canvas.classList.remove('dragging');
  });
}

function init() {
  initPalette();
  const sk = createSkillsScene();
  resizeSkills(sk);

  const skillsState = { rotY: 0, rotX: 0.28, ambientAngle: 0, dragging: false, parallax: { x: 0, y: 0, targetX: 0, targetY: 0 } };

  initInteractions(sk, skillsState);

  const ro2 = new ResizeObserver(() => resizeSkills(sk));
  ro2.observe(sk.wrap);

  function tick() {
    if (!isReducedMotion()) {
      if (!isMobile() && !skillsState.dragging) skillsState.ambientAngle += 0.0016;
      skillsState.parallax.x = lerp(skillsState.parallax.x, skillsState.parallax.targetX || 0, 0.06);
      skillsState.parallax.y = lerp(skillsState.parallax.y, skillsState.parallax.targetY || 0, 0.06);
    }
    updateSkills(sk, skillsState);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', init);
