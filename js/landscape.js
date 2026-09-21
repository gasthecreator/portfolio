import * as THREE from 'three';
import { oklchToRGB } from './color.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

const DAYC = { horizon: [1.0, 0.72, 0.5], mid: [0.6, 0.7, 0.85], zen: [0.27, 0.46, 0.72] };
const NIGHTC = { horizon: [0.3, 0.22, 0.46], mid: [0.1, 0.12, 0.29], zen: [0.03, 0.04, 0.13] };
const DAY_DIR = [0.6, 0.24, -0.75];
const NIGHT_DIR = [0.37, 0.38, -0.85];
const mixC = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqMobile = window.matchMedia('(max-width: 900px)');

const NOISE = /* glsl */ `
  float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float a = 0.5, s = 0.0;
    for (int i = 0; i < OCT; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
    return s;
  }
`;

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vDir = w.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const SKY_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vDir;
  uniform vec3 uSunDir, uHorizon, uMid, uZenith, uPage;
  uniform float uTime, uFade, uLinearOut, uNight;
  ${NOISE}
  float hash31(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  void main() {
    vec3 dir = normalize(vDir);
    float h = dir.y;
    vec3 sky = mix(uHorizon, uMid, smoothstep(0.0, 0.28, h));
    sky = mix(sky, uZenith, smoothstep(0.22, 0.85, h));
    float sd = max(dot(dir, uSunDir), 0.0);
    float disc = mix(pow(sd, 90.0) * 0.9, pow(sd, 900.0) * 1.4, uNight);
    float halo = mix(pow(sd, 7.0) * 0.32, pow(sd, 14.0) * 0.22, uNight);
    sky += mix(vec3(1.0, 0.68, 0.38), vec3(0.82, 0.9, 1.0), uNight) * (disc + halo);
    vec3 stars = vec3(0.0);
    if (uNight > 0.01 && h > 0.0) {
      vec3 sp = dir * 160.0;
      vec3 id = floor(sp);
      float rnd = hash31(id);
      float d = length(fract(sp) - 0.5);
      float tw = 0.65 + 0.35 * sin(uTime * 2.0 + rnd * 40.0);
      float s = smoothstep(0.2, 0.0, d) * step(0.972, rnd) * tw * smoothstep(0.03, 0.3, h) * uNight;
      stars = vec3(0.9, 0.93, 1.0) * s * 2.2;
    }
    if (h > 0.0) {
      vec2 uv = dir.xz / (h + 0.14) * 1.5 + vec2(uTime * 0.012, uTime * 0.004);
      float d = fbm(uv);
      float d2 = fbm(uv + uSunDir.xz * 0.28);
      float cover = smoothstep(0.46, 0.8, d) * smoothstep(0.0, 0.16, h);
      float lit = clamp((d - d2) * 4.2 + 0.55, 0.0, 1.0);
      vec3 dayCloud = mix(vec3(0.48, 0.44, 0.56), vec3(1.0, 0.8, 0.58), lit);
      dayCloud = mix(dayCloud, vec3(1.0, 0.95, 0.88), smoothstep(0.62, 0.85, d) * 0.5);
      vec3 nightCloud = mix(vec3(0.06, 0.07, 0.16), vec3(0.42, 0.48, 0.7), lit * 0.8);
      sky = mix(sky, mix(dayCloud, nightCloud, uNight), cover);
      stars *= (1.0 - cover);
    }
    sky += stars;
    sky = mix(sky, uHorizon, smoothstep(0.02, -0.06, h));
    sky = mix(sky, uPage, uFade);
    gl_FragColor = vec4(mix(sky, pow(sky, vec3(2.2)), uLinearOut), 1.0);
  }
`;

const TERRAIN_COMMON = /* glsl */ `
  ${NOISE}
  float pathX(float z) { return sin(z * 0.018) * 14.0; }
  float terrainH(vec2 xz) {
    float d = abs(xz.x - pathX(xz.y));
    float valley = smoothstep(14.0, 105.0, d);
    float base = fbm(xz * 0.010) * 40.0;
    float ridge = 1.0 - abs(fbm(xz * 0.018 + 7.3) * 2.0 - 1.0);
    ridge = ridge * ridge * 34.0;
    float rolling = fbm(xz * 0.05) * 3.0;
    return (base + ridge) * valley * valley + rolling * (1.0 - valley * 0.6) - 2.0;
  }
`;

const TERRAIN_VERT = /* glsl */ `
  ${TERRAIN_COMMON}
  varying vec3 vWorld; varying vec3 vN;
  void main() {
    vec3 p = position;
    p.y = terrainH(p.xz);
    float e = 1.4;
    float hx = terrainH(p.xz + vec2(e, 0.0));
    float hz = terrainH(p.xz + vec2(0.0, e));
    vN = normalize(vec3(p.y - hx, e, p.y - hz));
    vec4 w = modelMatrix * vec4(p, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const TERRAIN_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vWorld; varying vec3 vN;
  uniform vec3 uSunDir, uHaze, uCam, uPage;
  uniform float uFade, uNight;
  float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  void main() {
    vec3 n = normalize(vN);
    float slope = 1.0 - n.y;
    float speck = vnoise(vWorld.xz * 0.45) * 0.6 + vnoise(vWorld.xz * 2.1) * 0.4;
    vec3 grassA = vec3(0.42, 0.42, 0.16);
    vec3 grassB = vec3(0.86, 0.66, 0.28);
    vec3 grass = mix(grassA, grassB, speck);
    vec3 rock = mix(vec3(0.42, 0.28, 0.2), vec3(0.62, 0.4, 0.26), speck);
    vec3 col = mix(grass, rock, smoothstep(0.22, 0.5, slope + (speck - 0.5) * 0.2));
    col = mix(col, col * vec3(0.55, 0.72, 1.0), uNight);
    float diff = max(dot(n, uSunDir), 0.0);
    vec3 sunLight = mix(vec3(1.0, 0.74, 0.44) * 1.9, vec3(0.5, 0.66, 1.0) * 1.05, uNight);
    vec3 amb = mix(vec3(0.42, 0.48, 0.66), vec3(0.14, 0.18, 0.34), uNight);
    vec3 c = col * (sunLight * diff + amb * (0.42 + 0.58 * n.y));
    float dist = length(vWorld - uCam);
    float fog = 1.0 - exp(-pow(dist * 0.0032, 1.3));
    c = mix(c, uHaze, clamp(fog, 0.0, 1.0));
    c = mix(c, uPage, uFade);
    gl_FragColor = vec4(c, 1.0);
  }
`;

const CARD_W = 720, CARD_H = 1008, CARD_R = 62;

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeCanvasTexture(drawFn) {
  const c = document.createElement('canvas');
  c.width = CARD_W; c.height = CARD_H;
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const redraw = () => { ctx.clearRect(0, 0, CARD_W, CARD_H); drawFn(ctx); tex.needsUpdate = true; };
  redraw();
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('600 96px Newsreader'), document.fonts.load('500 30px "IBM Plex Mono"'), document.fonts.load('500 32px "IBM Plex Sans"')]).then(redraw).catch(() => {});
  }
  return { tex, redraw };
}

// Front: portrait photo with a soft caption
function makeFrontTexture() {
  const img = new Image();
  let loaded = false;
  const { tex, redraw } = makeCanvasTexture((ctx) => {
    roundRectPath(ctx, 0, 0, CARD_W, CARD_H, CARD_R);
    ctx.save(); ctx.clip();
    if (loaded) {
      ctx.drawImage(img, 0, 0, CARD_W, CARD_H);
    } else {
      ctx.fillStyle = '#2b3350'; ctx.fillRect(0, 0, CARD_W, CARD_H);
    }
    ctx.restore();
  });
  img.onload = () => { loaded = true; redraw(); };
  img.src = 'assets/gideon-card.jpg';
  return tex;
}

// Back: business card
function makeBackTexture() {
  const { tex } = makeCanvasTexture((ctx) => {
    roundRectPath(ctx, 0, 0, CARD_W, CARD_H, CARD_R);
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    g.addColorStop(0, '#1b2140'); g.addColorStop(1, '#2a2050');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(251,246,236,0.18)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.fillStyle = '#f2b46a';
    ctx.font = '500 30px "IBM Plex Mono", monospace';
    ctx.fillText('AVAILABLE FOR WORK', 60, 112);
    ctx.fillStyle = '#fbf6ec';
    ctx.font = '600 104px Newsreader, Georgia, serif';
    ctx.fillText('Gideon', 60, 400);
    ctx.fillText('Sanni', 60, 502);
    ctx.font = '500 40px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = 'rgba(251,246,236,0.92)';
    ctx.fillText('Software Engineer', 60, 584);
    ctx.strokeStyle = 'rgba(251,246,236,0.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, 700); ctx.lineTo(CARD_W - 60, 700); ctx.stroke();
    ctx.font = '500 33px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#fbf6ec';
    ctx.fillText('gideonsanni2023@gmail.com', 46, 790);
    ctx.fillText('Grambling State University', 46, 850);
    ctx.fillStyle = 'rgba(251,246,236,0.78)';
    ctx.fillText('Grambling, LA', 46, 910);
  });
  return tex;
}

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function init() {
  const canvas = document.getElementById('landscape-canvas');
  const pin = document.querySelector('.hero-pin');
  if (!canvas || !pin) return;

  const mobile = mqMobile.matches;
  const reduced = mqReduced.matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));

  const OCT = mobile ? 4 : 5;
  const PAGE = { light: 'oklch(0.955 0.02 245)', dark: 'oklch(0.19 0.045 268)' };
  const pageColor = () => new THREE.Color(...oklchToRGB(PAGE[document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light']));
  const sunDir = new THREE.Vector3(0.6, 0.24, -0.75).normalize();
  const horizon = new THREE.Color(1.0, 0.72, 0.5);

  const skyUniforms = {
    uSunDir: { value: sunDir }, uHorizon: { value: horizon.clone() },
    uMid: { value: new THREE.Color(0.6, 0.7, 0.85) }, uZenith: { value: new THREE.Color(0.27, 0.46, 0.72) },
    uPage: { value: pageColor() }, uTime: { value: 0 }, uFade: { value: 0 }, uLinearOut: { value: 0 }, uNight: { value: 0 },
  };
  const skyMat = new THREE.ShaderMaterial({
    uniforms: skyUniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
    side: THREE.BackSide, depthWrite: false, depthTest: false, defines: { OCT: 4 },
  });
  const skyGeo = new THREE.SphereGeometry(1000, 32, 16);
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.renderOrder = -10; sky.frustumCulled = false;

  const scene = new THREE.Scene();
  scene.add(sky);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2500);

  // terrain
  const segX = mobile ? 110 : 200, segZ = mobile ? 200 : 360;
  const tGeo = new THREE.PlaneGeometry(440, 780, segX, segZ);
  tGeo.rotateX(-Math.PI / 2);
  tGeo.translate(0, 0, -270);
  const terrainUniforms = {
    uSunDir: { value: sunDir }, uHaze: { value: horizon.clone() }, uCam: { value: new THREE.Vector3() },
    uPage: { value: pageColor() }, uFade: { value: 0 }, uNight: { value: 0 },
  };
  const terrain = new THREE.Mesh(tGeo, new THREE.ShaderMaterial({
    uniforms: terrainUniforms, vertexShader: TERRAIN_VERT, fragmentShader: TERRAIN_FRAG, defines: { OCT },
  }));
  terrain.frustumCulled = false;
  scene.add(terrain);

  // environment for the glass card, captured from the same sky
  const envScene = new THREE.Scene();
  const envMat = skyMat.clone();
  envMat.uniforms.uLinearOut.value = 1;
  envMat.uniforms.uFade.value = 0;
  const envSky = new THREE.Mesh(skyGeo, envMat);
  envScene.add(envSky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null;
  const rebuildEnv = (n) => {
    const h = mixC(DAYC.horizon, NIGHTC.horizon, n);
    envMat.uniforms.uHorizon.value.setRGB(...h);
    envMat.uniforms.uMid.value.setRGB(...mixC(DAYC.mid, NIGHTC.mid, n));
    envMat.uniforms.uZenith.value.setRGB(...mixC(DAYC.zen, NIGHTC.zen, n));
    envMat.uniforms.uNight.value = n;
    envMat.uniforms.uSunDir.value.set(...mixC(DAY_DIR, NIGHT_DIR, n)).normalize();
    const old = envRT;
    envRT = pmrem.fromScene(envScene, 0, 1, 2000);
    scene.environment = envRT.texture;
    if (old) old.dispose();
  };
  const isDark = () => document.documentElement.dataset.theme === 'dark';
  const state = { p: 0, time: 0, mx: 0, my: 0, tx: 0, ty: 0, night: isDark() ? 1 : 0, nightTarget: isDark() ? 1 : 0 };
  const setNight = (n) => {
    const h = mixC(DAYC.horizon, NIGHTC.horizon, n);
    sunDir.set(...mixC(DAY_DIR, NIGHT_DIR, n)).normalize();
    skyUniforms.uHorizon.value.setRGB(...h);
    skyUniforms.uMid.value.setRGB(...mixC(DAYC.mid, NIGHTC.mid, n));
    skyUniforms.uZenith.value.setRGB(...mixC(DAYC.zen, NIGHTC.zen, n));
    terrainUniforms.uHaze.value.setRGB(...h);
    skyUniforms.uNight.value = n;
    terrainUniforms.uNight.value = n;
  };
  setNight(state.night);
  rebuildEnv(state.nightTarget);

  // glass card
  const card = new THREE.Group();
  const shape = roundedRectShape(1.5, 2.1, 0.16);
  const cardGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 5, curveSegments: 18 });
  cardGeo.translate(0, 0, -0.035);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04,
    envMapIntensity: 1.5, ior: 1.45, specularIntensity: 1,
    ...(mobile ? { transparent: true, opacity: 0.3 } : { transmission: 1, thickness: 0.7, attenuationColor: new THREE.Color(1, 0.86, 0.7), attenuationDistance: 4 }),
  });
  card.add(new THREE.Mesh(cardGeo, glass));
  const frontMat = new THREE.MeshBasicMaterial({ map: makeFrontTexture(), transparent: true, toneMapped: false, depthWrite: false });
  const backMat = new THREE.MeshBasicMaterial({ map: makeBackTexture(), transparent: true, toneMapped: false, depthWrite: false });
  const faceGeo = new THREE.PlaneGeometry(1.32, 1.848);
  const front = new THREE.Mesh(faceGeo, frontMat);
  front.position.z = 0.085;
  const back = new THREE.Mesh(faceGeo, backMat);
  back.position.z = -0.085; back.rotation.y = Math.PI;
  card.add(front, back);
  card.scale.setScalar(2.1);
  scene.add(card);

  window.addEventListener('themechange', () => {
    skyUniforms.uPage.value.copy(pageColor());
    terrainUniforms.uPage.value.copy(pageColor());
    state.nightTarget = isDark() ? 1 : 0;
    if (reduced) { state.night = state.nightTarget; setNight(state.night); }
    rebuildEnv(state.nightTarget);
  });

  const fwd = new THREE.Vector3(), look = new THREE.Vector3();

  function resize() {
    const w = pin.clientWidth, h = pin.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 62 : 50;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(pin);

  window.addEventListener('pointermove', (e) => {
    state.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    state.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function frame(dt) {
    const p = reduced ? 0 : state.p;
    state.mx = lerp(state.mx, reduced ? 0 : state.tx, 0.05);
    state.my = lerp(state.my, reduced ? 0 : state.ty, 0.05);
    if (!reduced) state.time += dt;
    if (state.night !== state.nightTarget) {
      state.night += (state.nightTarget - state.night) * Math.min(1, dt * 2.4);
      if (Math.abs(state.nightTarget - state.night) < 0.002) state.night = state.nightTarget;
      setNight(state.night);
    }

    const ease = p * p * (3 - 2 * p);
    const z = lerp(70, -210, ease);
    const y = lerp(9, 17, ease) + state.my * -0.8;
    const px = Math.sin(z * 0.018) * 14.0;
    camera.position.set(px + state.mx * 2.2, y, z);
    const lookZ = z - 60;
    const lookX = Math.sin(lookZ * 0.018) * 14.0;
    const lookY = lerp(21, 9, smooth(0, 0.6, p)) + smooth(0.45, 0.9, p) * 46;
    look.set(lookX, lookY, lookZ);
    camera.lookAt(look);

    sky.position.copy(camera.position);
    skyUniforms.uTime.value = state.time;
    const fade = smooth(0.6, 0.9, p);
    skyUniforms.uFade.value = fade;
    terrainUniforms.uFade.value = fade;
    terrainUniforms.uCam.value.copy(camera.position);

    camera.getWorldDirection(fwd);
    card.position.copy(camera.position).addScaledVector(fwd, 10.5);
    const portrait = camera.aspect < 0.8;
    card.position.x += portrait ? 0 : 1.4;
    card.position.y += portrait ? 2.4 : 0.5 + Math.sin(state.time * 0.8) * 0.12;
    card.rotation.set(state.my * 0.18, p * Math.PI * 1.7 + state.mx * 0.35 + Math.sin(state.time * 0.4) * 0.12, Math.sin(state.time * 0.5) * 0.03);
    const cardVis = 1 - smooth(0.55, 0.8, p);
    card.visible = cardVis > 0.01;
    card.scale.setScalar(2.1 * (0.6 + 0.4 * cardVis));

    renderer.render(scene, camera);
    canvas.classList.add('ready');
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const r = canvas.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) frame(dt);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  if (reduced) return;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero', start: 'top top', end: mobile ? '+=150%' : '+=220%',
      pin: '.hero-pin', scrub: true, refreshPriority: 10,
      onUpdate: (self) => { state.p = self.progress; },
    },
  });
  tl.to('.scroll-cue', { opacity: 0, duration: 0.08, ease: 'none' }, 0)
    .to('.hero-aside', { opacity: 0, y: -40, duration: 0.25, ease: 'none' }, 0.12)
    .to('.hero-name', { yPercent: -28, opacity: 0, scale: 0.94, transformOrigin: '0% 100%', duration: 0.4, ease: 'none' }, 0.3)
    .to('.hero-kicker', { opacity: 0, duration: 0.2, ease: 'none' }, 0.3)
    .to('.hero-vignette', { opacity: 0, duration: 0.3, ease: 'none' }, 0.6)
    .to({}, { duration: 0.001 }, 1);
  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
