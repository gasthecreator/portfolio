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

const SKILL_CATEGORIES = [
  { name: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Go'] },
  { name: 'Frontend', items: ['React', 'Next.js', 'Three.js / R3F', 'Tailwind CSS'] },
  { name: 'Backend', items: ['Node.js', 'PostgreSQL', 'GraphQL', 'Redis'] },
  { name: 'Infra & Tools', items: ['Docker', 'AWS', 'CI/CD', 'Git'] },
  { name: 'Design', items: ['Figma', 'Motion design', 'Design systems'] },
];

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

// ---------- hero network ----------
function createHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  const wrap = document.getElementById('hero-canvas-wrap');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLOR.fog.getHex(), 340, 1000);
  const camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
  camera.position.set(0, 0, 620);

  // Bloom needs an opaque frame (it drops alpha), so on desktop the CSS gradient is recreated as the scene background.
  let composer = null;
  if (!isMobile()) {
    scene.background = makeGradientBackground();
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.55, 0.62));
    composer.addPass(new OutputPass());
  }

  const group = new THREE.Group();
  scene.add(group);

  const rand = mulberry32(1337);
  const N = 20;
  const baseNodes = [];
  const structNodes = [];
  for (let i = 0; i < N; i++) {
    const theta = rand() * Math.PI * 2, phi = Math.acos(2 * rand() - 1), r = 95 + rand() * 55;
    baseNodes.push(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.72, r * Math.cos(phi)));
  }
  const layers = [4, 6, 6, 4]; let idx = 0;
  layers.forEach((count, l) => {
    for (let i = 0; i < count; i++) {
      structNodes[idx] = new THREE.Vector3((i - (count - 1) / 2) * 58, (l - 1.5) * 68, (l % 2 === 0 ? -18 : 18) + (i % 2) * 10);
      idx++;
    }
  });
  const edges = [];
  const edgeSet = new Set();
  for (let i = 0; i < N; i++) {
    const dists = [];
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      dists.push([j, baseNodes[i].distanceToSquared(baseNodes[j])]);
    }
    dists.sort((a, b) => a[1] - b[1]);
    for (let k = 0; k < 2; k++) {
      const j = dists[k][0], key = i < j ? i + '-' + j : j + '-' + i;
      if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([i, j]); }
    }
  }
  const degree = new Array(N).fill(0);
  edges.forEach(([a, b]) => { degree[a]++; degree[b]++; });
  const hubs = new Set(degree.map((d, i) => [d, i]).sort((a, b) => b[0] - a[0]).slice(0, 3).map((x) => x[1]));

  const nodeGeo = new THREE.SphereGeometry(1, 12, 12);
  const nodeMeshes = baseNodes.map((_, i) => {
    const isHub = hubs.has(i);
    const mat = new THREE.MeshBasicMaterial({ color: isHub ? COLOR.hubNode : COLOR.node, fog: true });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.scale.setScalar(isHub ? 5.5 : 3.2);
    group.add(mesh);
    return mesh;
  });

  const glowTexture = makeGlowTexture();
  const glowSprites = [...hubs].map((i) => {
    const mat = new THREE.SpriteMaterial({ map: glowTexture, color: COLOR.hubNode, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.setScalar(46);
    group.add(sprite);
    return { i, sprite };
  });

  const edgePositions = new Float32Array(edges.length * 2 * 3);
  const edgeColors = new Float32Array(edges.length * 2 * 3);
  edges.forEach(([a, b], i) => {
    const c = (hubs.has(a) && hubs.has(b)) ? COLOR.hubEdge : COLOR.heroEdge;
    edgeColors[i * 6 + 0] = c.r; edgeColors[i * 6 + 1] = c.g; edgeColors[i * 6 + 2] = c.b;
    edgeColors[i * 6 + 3] = c.r; edgeColors[i * 6 + 4] = c.g; edgeColors[i * 6 + 5] = c.b;
  });
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
  edgeGeo.setAttribute('color', new THREE.BufferAttribute(edgeColors, 3));
  const edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, fog: true });
  const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
  group.add(edgeLines);

  return { canvas, wrap, renderer, composer, scene, camera, group, baseNodes, structNodes, edges, hubs, nodeMeshes, glowSprites, edgeGeo };
}

function resizeHero(hero) {
  const w = hero.wrap.clientWidth, h = hero.wrap.clientHeight;
  if (w === 0 || h === 0) return;
  hero.renderer.setSize(w, h, false);
  if (hero.composer) { hero.composer.setPixelRatio(hero.renderer.getPixelRatio()); hero.composer.setSize(w, h); }
  hero.camera.aspect = w / h;
  hero.camera.updateProjectionMatrix();
}

function updateHero(hero, state) {
  const reduced = isReducedMotion();
  const mobile = isMobile();
  const heroFullFX = !reduced && !mobile;
  const scrollT = heroFullFX ? state.scrollProgress : 0;
  const explodeVal = reduced ? (state.explodeOn ? 1 : 0) : state.explodeT;
  const ambient = heroFullFX ? state.ambientAngle : 0;
  const parX = heroFullFX ? state.parallax.x : 0, parY = heroFullFX ? state.parallax.y : 0;
  const rotY = state.rotY + ambient + parX;
  const rotX = clamp(state.rotX + parY, -1, 1);
  hero.group.rotation.y = rotY;
  hero.group.rotation.x = rotX;

  const spread = 1 + explodeVal * 1.6;
  for (let i = 0; i < hero.baseNodes.length; i++) {
    const b = hero.baseNodes[i], st = hero.structNodes[i];
    hero.nodeMeshes[i].position.set(
      lerp(b.x, st.x, scrollT) * spread,
      lerp(b.y, st.y, scrollT) * spread,
      lerp(b.z, st.z, scrollT) * spread
    );
  }
  hero.glowSprites.forEach(({ i, sprite }) => sprite.position.copy(hero.nodeMeshes[i].position));

  const posArr = hero.edgeGeo.attributes.position.array;
  hero.edges.forEach(([a, b], i) => {
    const pa = hero.nodeMeshes[a].position, pb = hero.nodeMeshes[b].position;
    posArr[i * 6 + 0] = pa.x; posArr[i * 6 + 1] = pa.y; posArr[i * 6 + 2] = pa.z;
    posArr[i * 6 + 3] = pb.x; posArr[i * 6 + 4] = pb.y; posArr[i * 6 + 5] = pb.z;
  });
  hero.edgeGeo.attributes.position.needsUpdate = true;

  if (hero.composer) hero.composer.render(); else hero.renderer.render(hero.scene, hero.camera);

  const rotXDeg = Math.round((rotX * 180) / Math.PI);
  const rotYDeg = Math.round(((rotY % (2 * Math.PI)) * 180) / Math.PI);
  document.getElementById('hud-edge-count').textContent = String(hero.edges.length);
  document.getElementById('hud-rot').textContent = `X ${rotXDeg}° · Y ${rotYDeg}°`;
  document.getElementById('hud-hint').textContent = mobile ? 'DRAG TO ORBIT' : 'DRAG TO ORBIT · SCROLL TO MORPH';
  document.getElementById('explode-btn').textContent = state.explodeOn ? '[ REASSEMBLE ]' : '[ EXPLODE ]';
}

// ---------- skills cluster ----------
function createSkillsScene() {
  const canvas = document.getElementById('skills-canvas');
  const wrap = document.getElementById('skills-cluster-wrap');
  const labelsContainer = document.getElementById('skills-labels');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLOR.fog.getHex(), 300, 950);
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
  const spokeMat = new THREE.LineBasicMaterial({ color: COLOR.edge, transparent: true, opacity: 0.5, fog: true });
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
function initInteractions(hero, sk, heroState, skillsState) {
  let dragCtx = null;

  hero.wrap.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#explode-btn')) return;
    e.preventDefault();
    dragCtx = { type: 'hero', x: e.clientX, y: e.clientY, rx: heroState.rotX, ry: heroState.rotY };
    heroState.dragging = true;
    hero.canvas.classList.add('dragging');
  });
  sk.wrap.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragCtx = { type: 'cluster', x: e.clientX, y: e.clientY, rx: skillsState.rotX, ry: skillsState.rotY };
    skillsState.dragging = true;
    sk.canvas.classList.add('dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (dragCtx) {
      const dx = e.clientX - dragCtx.x, dy = e.clientY - dragCtx.y;
      if (dragCtx.type === 'hero') {
        heroState.rotY = dragCtx.ry + dx * 0.008;
        heroState.rotX = clamp(dragCtx.rx - dy * 0.008, -0.85, 0.85);
      } else {
        skillsState.rotY = dragCtx.ry + dx * 0.01;
        skillsState.rotX = clamp(dragCtx.rx - dy * 0.01, -0.8, 0.8);
      }
      return;
    }
    if (!isReducedMotion()) {
      const r = hero.wrap.getBoundingClientRect();
      const px = clamp((e.clientX - r.left) / r.width, 0, 1), py = clamp((e.clientY - r.top) / r.height, 0, 1);
      heroState.parallax.targetX = (px - 0.5) * 0.35; heroState.parallax.targetY = (py - 0.5) * 0.35;
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
    const t = dragCtx.type; dragCtx = null;
    if (t === 'hero') { heroState.dragging = false; hero.canvas.classList.remove('dragging'); }
    else { skillsState.dragging = false; sk.canvas.classList.remove('dragging'); }
  });
  document.getElementById('explode-btn').addEventListener('click', () => {
    heroState.explodeOn = !heroState.explodeOn;
    if (isReducedMotion()) heroState.explodeT = heroState.explodeOn ? 1 : 0;
  });
}

function init() {
  initPalette();
  const hero = createHeroScene();
  const sk = createSkillsScene();
  resizeHero(hero);
  resizeSkills(sk);

  const heroState = { rotY: 0.5, rotX: 0.18, explodeOn: false, ambientAngle: 0, explodeT: 0, scrollProgress: 0, dragging: false, parallax: { x: 0, y: 0, targetX: 0, targetY: 0 } };
  const skillsState = { rotY: 0, rotX: 0.28, ambientAngle: 0, dragging: false, parallax: { x: 0, y: 0, targetX: 0, targetY: 0 } };

  initInteractions(hero, sk, heroState, skillsState);

  const ro1 = new ResizeObserver(() => resizeHero(hero));
  ro1.observe(hero.wrap);
  const ro2 = new ResizeObserver(() => resizeSkills(sk));
  ro2.observe(sk.wrap);

  function onScroll() {
    const r = hero.wrap.getBoundingClientRect();
    heroState.scrollProgress = clamp(1 - (r.top + r.height * 0.5) / (window.innerHeight * 0.9), 0, 1);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  document.getElementById('hud-node-count').textContent = String(hero.baseNodes.length);

  function tick() {
    if (!isReducedMotion()) {
      if (!heroState.dragging) heroState.ambientAngle += 0.0022;
      if (!isMobile() && !skillsState.dragging) skillsState.ambientAngle += 0.0016;
      heroState.parallax.x = lerp(heroState.parallax.x, heroState.parallax.targetX || 0, 0.06);
      heroState.parallax.y = lerp(heroState.parallax.y, heroState.parallax.targetY || 0, 0.06);
      skillsState.parallax.x = lerp(skillsState.parallax.x, skillsState.parallax.targetX || 0, 0.06);
      skillsState.parallax.y = lerp(skillsState.parallax.y, skillsState.parallax.targetY || 0, 0.06);
      const target = heroState.explodeOn ? 1 : 0;
      heroState.explodeT += (target - heroState.explodeT) * 0.08;
    }
    updateHero(hero, heroState);
    updateSkills(sk, skillsState);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', init);
