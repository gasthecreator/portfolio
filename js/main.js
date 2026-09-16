(function () {
  'use strict';

  // ---------- helpers ----------
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function pointerInRect(e, rect) {
    return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
  }

  const mqMobile = window.matchMedia('(max-width: 900px)');
  const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function isMobile() { return mqMobile.matches; }
  function isReducedMotion() { return mqReduced.matches; }

  // ---------- data ----------
  const NAV_ITEMS = [
    { id: 'hero', label: 'Home', n: '00' }, { id: 'about', label: 'About', n: '01' },
    { id: 'skills', label: 'Skills', n: '02' }, { id: 'featured', label: 'Work', n: '03' },
    { id: 'archive', label: 'Archive', n: '04' }, { id: 'experience', label: 'Experience', n: '05' },
    { id: 'education', label: 'Education', n: '06' }, { id: 'contact', label: 'Contact', n: '07' },
  ].map((i) => ({ ...i, href: '#' + i.id }));

  const SKILL_CATEGORIES = [
    { name: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Go'] },
    { name: 'Frontend', items: ['React', 'Next.js', 'Three.js / R3F', 'Tailwind CSS'] },
    { name: 'Backend', items: ['Node.js', 'PostgreSQL', 'GraphQL', 'Redis'] },
    { name: 'Infra & Tools', items: ['Docker', 'AWS', 'CI/CD', 'Git'] },
    { name: 'Design', items: ['Figma', 'Motion design', 'Design systems'] },
  ];
  const CAT_COLORS = ['oklch(0.86 0.03 130)', 'oklch(0.78 0.09 146)', 'oklch(0.7 0.07 140)', 'oklch(0.62 0.05 150)', 'oklch(0.9 0.02 120)'];

  const FEATURED_RAW = [
    { id: 'f1', idx: '01', name: '[Project Name One]', tagline: '[One-line summary of what it does and who it is for]', tags: ['React', 'Node.js', 'PostgreSQL'] },
    { id: 'f2', idx: '02', name: '[Project Name Two]', tagline: '[One-line summary of what it does and who it is for]', tags: ['Next.js', 'Three.js', 'WebGL'] },
    { id: 'f3', idx: '03', name: '[Project Name Three]', tagline: '[One-line summary of what it does and who it is for]', tags: ['TypeScript', 'GraphQL', 'Redis'] },
  ].map((p) => ({ ...p, problem: '[Placeholder problem statement]', stack: '[Placeholder stack notes]', outcome: '[Placeholder outcome]' }));

  const ARCHIVE_RAW = [
    { id: 'a1', name: '[Archive Project A]', tech: ['React', 'Node.js'], domain: 'Web App', status: 'shipped' },
    { id: 'a2', name: '[Archive Project B]', tech: ['Python', 'Docker'], domain: 'Tooling', status: 'shipped' },
    { id: 'a3', name: '[Archive Project C]', tech: ['Three.js', 'React'], domain: 'Data Viz', status: 'in-progress' },
    { id: 'a4', name: '[Archive Project D]', tech: ['Go', 'Redis'], domain: 'API', status: 'shipped' },
    { id: 'a5', name: '[Archive Project E]', tech: ['Vue', 'GraphQL'], domain: 'Web App', status: 'archived' },
    { id: 'a6', name: '[Archive Project F]', tech: ['Rust', 'Docker'], domain: 'Experiment', status: 'in-progress' },
    { id: 'a7', name: '[Archive Project G]', tech: ['React', 'GraphQL'], domain: 'Design System', status: 'shipped' },
    { id: 'a8', name: '[Archive Project H]', tech: ['Python', 'React'], domain: 'Open Source', status: 'archived' },
  ];

  const EXPERIENCE = [
    { dates: '2024 — Present', role: '[Role Title]', org: '[Company Name]', desc: '[Placeholder description of responsibilities and impact in this role]', tags: ['React', 'TypeScript'] },
    { dates: '2022 — 2024', role: '[Role Title]', org: '[Company Name]', desc: '[Placeholder description of responsibilities and impact in this role]', tags: ['Node.js', 'AWS'] },
    { dates: '2020 — 2022', role: '[Role Title]', org: '[Company Name]', desc: '[Placeholder description of responsibilities and impact in this role]', tags: ['Python'] },
  ];
  const EDUCATION = [
    { degree: '[Degree, Field of Study]', school: '[University Name]', note: '[Placeholder — honors, focus area]', dates: '2016 — 2020' },
  ];
  const STATUS_META = {
    shipped: { label: 'Shipped', color: 'oklch(0.36 0.09 150)' },
    'in-progress': { label: 'In progress', color: 'oklch(0.55 0.06 130)' },
    archived: { label: 'Archived', color: 'oklch(0.55 0.01 144)' },
  };

  // ---------- nav ----------
  function renderNav() {
    document.getElementById('sidebar-nav').innerHTML =
      NAV_ITEMS.map((i) => `<a href="${i.href}"><span>${i.n}</span></a>`).join('');
    document.getElementById('mobile-menu-nav').innerHTML =
      NAV_ITEMS.map((i) => `<a href="${i.href}" data-close><span class="n">${i.n}</span><span class="label">${esc(i.label)}</span></a>`).join('');
  }

  function initMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('mobile-menu');
    const closeBtn = document.getElementById('mobile-menu-close');
    function open() { menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    function close() { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', () => (menu.classList.contains('open') ? close() : open()));
    closeBtn.addEventListener('click', close);
    menu.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  }

  // ---------- hero network (seeded, deterministic) ----------
  const rand = mulberry32(1337);
  const N = 20;
  const baseNodes = [];
  const structNodes = [];
  for (let i = 0; i < N; i++) {
    const theta = rand() * Math.PI * 2, phi = Math.acos(2 * rand() - 1), r = 95 + rand() * 55;
    baseNodes.push({ x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta) * 0.72, z: r * Math.cos(phi) });
  }
  (function buildStructNodes() {
    const layers = [4, 6, 6, 4]; let idx = 0;
    layers.forEach((count, l) => {
      for (let i = 0; i < count; i++) {
        structNodes[idx] = { x: (i - (count - 1) / 2) * 58, y: (l - 1.5) * 68, z: (l % 2 === 0 ? -18 : 18) + (i % 2) * 10 };
        idx++;
      }
    });
  })();
  const edges = [];
  (function buildEdges() {
    const edgeSet = new Set();
    for (let i = 0; i < N; i++) {
      const dists = [];
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const a = baseNodes[i], b = baseNodes[j];
        dists.push([j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2]);
      }
      dists.sort((a, b) => a[1] - b[1]);
      for (let k = 0; k < 2; k++) {
        const j = dists[k][0], key = i < j ? i + '-' + j : j + '-' + i;
        if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([i, j]); }
      }
    }
  })();
  const hubs = (function buildHubs() {
    const degree = new Array(N).fill(0);
    edges.forEach(([a, b]) => { degree[a]++; degree[b]++; });
    return new Set(degree.map((d, i) => [d, i]).sort((a, b) => b[0] - a[0]).slice(0, 3).map((x) => x[1]));
  })();

  const heroState = { rotX: 0.18, rotY: 0.5, explodeOn: false };
  let heroDragging = false;
  let ambientAngle = 0, explodeT = 0, scrollProgress = 0;
  const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function renderHero() {
    const reduced = isReducedMotion();
    const mobile = isMobile();
    const heroFullFX = !reduced && !mobile;
    const scrollT = heroFullFX ? scrollProgress : 0;
    const explodeVal = reduced ? (heroState.explodeOn ? 1 : 0) : explodeT;
    const ambient = heroFullFX ? ambientAngle : 0;
    const parX = heroFullFX ? parallax.x : 0, parY = heroFullFX ? parallax.y : 0;
    const rotY = heroState.rotY + ambient + parX;
    const rotX = clamp(heroState.rotX + parY, -1, 1);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY), cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const projected = [];
    for (let i = 0; i < N; i++) {
      const b = baseNodes[i], st = structNodes[i];
      let x = lerp(b.x, st.x, scrollT), y = lerp(b.y, st.y, scrollT), z = lerp(b.z, st.z, scrollT);
      const spread = 1 + explodeVal * 1.6;
      x *= spread; y *= spread; z *= spread;
      const x1 = x * cosY - z * sinY, z1 = x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      const f = 460, scale = f / (f + z2);
      projected.push({ i, sx: x1 * scale, sy: y1 * scale, scale, z: z2 });
    }

    let nodesHtml = '';
    projected.slice().sort((a, b) => a.z - b.z).forEach((p) => {
      const r = (hubs.has(p.i) ? 5.5 : 3.2) * clamp(p.scale, 0.6, 1.3);
      const fill = hubs.has(p.i) ? 'oklch(0.76 0.12 146)' : 'oklch(0.86 0.03 128)';
      const opacity = clamp(0.45 + p.scale * 0.5, 0.35, 1);
      nodesHtml += `<circle cx="${p.sx.toFixed(2)}" cy="${p.sy.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}" opacity="${opacity.toFixed(3)}"></circle>`;
    });
    let edgesHtml = '';
    edges.forEach(([a, b]) => {
      const pa = projected[a], pb = projected[b];
      const midZ = (pa.z + pb.z) / 2;
      const stroke = (hubs.has(a) && hubs.has(b)) ? 'oklch(0.55 0.08 146)' : 'oklch(0.4 0.045 150)';
      const opacity = clamp(0.25 + (midZ + 150) / 500, 0.12, 0.65);
      edgesHtml += `<line x1="${pa.sx.toFixed(2)}" y1="${pa.sy.toFixed(2)}" x2="${pb.sx.toFixed(2)}" y2="${pb.sy.toFixed(2)}" stroke="${stroke}" stroke-width="1" opacity="${opacity.toFixed(3)}"></line>`;
    });
    document.getElementById('hero-edges').innerHTML = edgesHtml;
    document.getElementById('hero-nodes').innerHTML = nodesHtml;

    const rotXDeg = Math.round((rotX * 180) / Math.PI);
    const rotYDeg = Math.round(((rotY % (2 * Math.PI)) * 180) / Math.PI);
    document.getElementById('hud-edge-count').textContent = String(edges.length);
    document.getElementById('hud-rot').textContent = `X ${rotXDeg}° · Y ${rotYDeg}°`;
    document.getElementById('hud-hint').textContent = mobile ? 'DRAG TO ORBIT' : 'DRAG TO ORBIT · SCROLL TO MORPH';
    document.getElementById('explode-btn').textContent = heroState.explodeOn ? '[ REASSEMBLE ]' : '[ EXPLODE ]';
  }

  // ---------- skills cluster (fibonacci-sphere, seeded by category order) ----------
  const skillNodes = (function buildSkillNodes() {
    const flat = [];
    SKILL_CATEGORIES.forEach((cat, ci) => cat.items.forEach((name) => flat.push({ name, ci })));
    const SN = flat.length, golden = Math.PI * (3 - Math.sqrt(5)), R = 175;
    return flat.map((item, i) => {
      const yFrac = SN > 1 ? 1 - (i / (SN - 1)) * 2 : 0;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - yFrac * yFrac));
      const theta = golden * i;
      return { name: item.name, ci: item.ci, x: Math.cos(theta) * radiusAtY * R * 1.55, y: yFrac * R * 0.95, z: Math.sin(theta) * radiusAtY * R };
    });
  })();

  const clusterState = { rotX: 0.28, rotY: 0 };
  let clusterDragging = false;
  let skillsAngle = 0;
  const clusterParallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function renderSkills() {
    const reduced = isReducedMotion();
    const mobile = isMobile();
    const skillsFullFX = !reduced && !mobile;
    const skAmbient = skillsFullFX && !clusterDragging ? skillsAngle : 0;
    const skParX = skillsFullFX ? clusterParallax.x : 0, skParY = skillsFullFX ? clusterParallax.y : 0;
    const skAngle = clusterState.rotY + skAmbient + skParX;
    const skRotX = clamp(clusterState.rotX + skParY, -1, 1);
    const skCosY = Math.cos(skAngle), skSinY = Math.sin(skAngle), skCosX = Math.cos(skRotX), skSinX = Math.sin(skRotX);

    const skProjected = skillNodes.map((n, i) => {
      const x1 = n.x * skCosY - n.z * skSinY, z1 = n.x * skSinY + n.z * skCosY;
      const y1 = n.y * skCosX - z1 * skSinX, z2 = n.y * skSinX + z1 * skCosX;
      const f = 560, scale = f / (f + z2);
      return { i, name: n.name, ci: n.ci, sx: x1 * scale, sy: y1 * scale, scale, z: z2 };
    });

    const estHalfW = (p) => ((p.name.length * 6.3 + 30) * clamp(p.scale, 0.65, 1.1)) / 2;
    const estHalfH = (p) => 15 * clamp(p.scale, 0.65, 1.1);
    for (let it = 0; it < 6; it++) {
      for (let i = 0; i < skProjected.length; i++) {
        for (let j = i + 1; j < skProjected.length; j++) {
          const a = skProjected[i], b = skProjected[j];
          const minDx = estHalfW(a) + estHalfW(b) + 6, minDy = estHalfH(a) + estHalfH(b) + 4;
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

    let nodesHtml = '';
    skProjected.slice().sort((a, b) => a.z - b.z).forEach((p) => {
      const sc = clamp(p.scale, 0.65, 1.1);
      const op = clamp(0.4 + sc * 0.5, 0.35, 1);
      const fx = p.sx + 8 * sc, fy = p.sy - 9 * sc;
      nodesHtml += `<circle cx="${p.sx.toFixed(2)}" cy="${p.sy.toFixed(2)}" r="${(3.4 * sc).toFixed(2)}" fill="${CAT_COLORS[p.ci]}" opacity="${op.toFixed(3)}"></circle>` +
        `<foreignObject x="${fx.toFixed(2)}" y="${fy.toFixed(2)}" width="150" height="22" style="overflow:visible;pointer-events:none;">` +
        `<div xmlns="http://www.w3.org/1999/xhtml" class="skill-label" style="font-size:${(10.5 * sc).toFixed(1)}px;opacity:${op.toFixed(3)};">${esc(p.name)}</div>` +
        `</foreignObject>`;
    });
    let spokesHtml = '';
    skProjected.forEach((p) => {
      const opacity = clamp(0.08 + (p.z + 120) / 600, 0.04, 0.22);
      spokesHtml += `<line x1="0" y1="0" x2="${p.sx.toFixed(2)}" y2="${p.sy.toFixed(2)}" stroke="oklch(0.4 0.045 150)" stroke-width="1" opacity="${opacity.toFixed(3)}"></line>`;
    });
    document.getElementById('skills-spokes').innerHTML = spokesHtml;
    document.getElementById('skills-nodes').innerHTML = nodesHtml;
    document.getElementById('skills-hud-count').innerHTML = `STACK.VIS — ${skillNodes.length} NODES / ${SKILL_CATEGORIES.length} CATEGORIES`;
  }

  // ---------- shared drag + animation loop ----------
  let dragCtx = null;
  let rafId = null;
  function tick() {
    if (!heroDragging) ambientAngle += 0.0022;
    if (!isMobile() && !clusterDragging) skillsAngle += 0.0016;
    parallax.x = lerp(parallax.x, parallax.targetX || 0, 0.06);
    parallax.y = lerp(parallax.y, parallax.targetY || 0, 0.06);
    clusterParallax.x = lerp(clusterParallax.x, clusterParallax.targetX || 0, 0.06);
    clusterParallax.y = lerp(clusterParallax.y, clusterParallax.targetY || 0, 0.06);
    const target = heroState.explodeOn ? 1 : 0;
    explodeT += (target - explodeT) * 0.08;
    renderHero();
    renderSkills();
    rafId = requestAnimationFrame(tick);
  }
  function startLoop() { if (rafId == null) rafId = requestAnimationFrame(tick); }
  function stopLoop() { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

  function initInteractions() {
    const heroWrap = document.getElementById('hero-canvas-wrap');
    const clusterWrap = document.getElementById('skills-cluster-wrap');
    const heroSvg = document.getElementById('hero-svg');
    const clusterSvg = document.getElementById('skills-svg');

    heroWrap.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#explode-btn')) return;
      dragCtx = { type: 'hero', x: e.clientX, y: e.clientY, rx: heroState.rotX, ry: heroState.rotY };
      heroDragging = true;
      heroSvg.classList.add('dragging');
    });
    clusterWrap.addEventListener('pointerdown', (e) => {
      dragCtx = { type: 'cluster', x: e.clientX, y: e.clientY, rx: clusterState.rotX, ry: clusterState.rotY };
      clusterDragging = true;
      clusterSvg.classList.add('dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (dragCtx) {
        const dx = e.clientX - dragCtx.x, dy = e.clientY - dragCtx.y;
        if (dragCtx.type === 'hero') {
          heroState.rotY = dragCtx.ry + dx * 0.008;
          heroState.rotX = clamp(dragCtx.rx - dy * 0.008, -0.85, 0.85);
        } else {
          clusterState.rotY = dragCtx.ry + dx * 0.01;
          clusterState.rotX = clamp(dragCtx.rx - dy * 0.01, -0.8, 0.8);
        }
        renderHero(); renderSkills();
        return;
      }
      if (!isReducedMotion()) {
        const r = heroWrap.getBoundingClientRect();
        const px = clamp((e.clientX - r.left) / r.width, 0, 1), py = clamp((e.clientY - r.top) / r.height, 0, 1);
        parallax.targetX = (px - 0.5) * 0.35; parallax.targetY = (py - 0.5) * 0.35;
      }
      if (!isReducedMotion() && !isMobile()) {
        const r2 = clusterSvg.getBoundingClientRect();
        if (pointerInRect(e, r2)) {
          const px2 = clamp((e.clientX - r2.left) / r2.width, 0, 1), py2 = clamp((e.clientY - r2.top) / r2.height, 0, 1);
          clusterParallax.targetX = (px2 - 0.5) * 0.5; clusterParallax.targetY = (py2 - 0.5) * 0.4;
        } else {
          clusterParallax.targetX = 0; clusterParallax.targetY = 0;
        }
      }
    });
    window.addEventListener('pointerup', () => {
      if (!dragCtx) return;
      const t = dragCtx.type; dragCtx = null;
      if (t === 'hero') { heroDragging = false; heroSvg.classList.remove('dragging'); }
      else { clusterDragging = false; clusterSvg.classList.remove('dragging'); }
    });
    document.getElementById('explode-btn').addEventListener('click', () => {
      heroState.explodeOn = !heroState.explodeOn;
      if (isReducedMotion()) explodeT = heroState.explodeOn ? 1 : 0;
      renderHero();
    });
  }

  // ---------- card tilt/glare ----------
  function attachTilt(el, max) {
    el.addEventListener('mousemove', (e) => {
      if (isReducedMotion() || isMobile()) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width, py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -max, ry = (px - 0.5) * max;
      el.style.transition = 'transform .06s linear';
      el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      const glare = el.querySelector('[data-glare]');
      if (glare) glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.35), transparent 60%)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      const glare = el.querySelector('[data-glare]');
      if (glare) glare.style.background = 'transparent';
    });
  }

  // ---------- featured projects ----------
  function renderFeatured() {
    const container = document.getElementById('featured-list');
    container.innerHTML = FEATURED_RAW.map((p, i) => `
      <div class="project-card" data-project-id="${p.id}">
        <div class="project-card-inner${i % 2 === 1 ? ' reverse' : ''}">
          <div class="project-media media-placeholder">
            <div class="project-glare" data-glare></div>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span class="placeholder-label">[project screenshot]</span>
          </div>
          <div class="project-content">
            <div class="project-heading">
              <span class="project-idx">${esc(p.idx)}</span>
              <h3 class="project-name">${esc(p.name)}</h3>
            </div>
            <p class="project-tagline">${esc(p.tagline)}</p>
            <div class="tag-list">${p.tags.map((t) => `<span class="tag-chip">${esc(t)}</span>`).join('')}</div>
            <div class="project-meta">
              <div><div class="project-meta-label">Problem</div><div class="project-meta-val">${esc(p.problem)}</div></div>
              <div><div class="project-meta-label">Stack</div><div class="project-meta-val">${esc(p.stack)}</div></div>
              <div><div class="project-meta-label">Outcome</div><div class="project-meta-val">${esc(p.outcome)}</div></div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    container.querySelectorAll('.project-card').forEach((card) => {
      attachTilt(card, 6);
      card.addEventListener('click', () => openProject(card.dataset.projectId));
    });
  }

  // ---------- archive ----------
  let filters = { tech: new Set(), domain: new Set(), status: 'all' };
  let archiveDisplayed = ARCHIVE_RAW.slice();
  let archiveNewIds = new Set(ARCHIVE_RAW.map((p) => p.id));
  let filterTimer = null;

  function matchesFilters(p, f) {
    const techOk = f.tech.size === 0 || p.tech.some((t) => f.tech.has(t));
    const domainOk = f.domain.size === 0 || f.domain.has(p.domain);
    const statusOk = f.status === 'all' || p.status === f.status;
    return techOk && domainOk && statusOk;
  }
  function applyFilters(newFilters) {
    const oldMatches = ARCHIVE_RAW.filter((p) => matchesFilters(p, filters));
    const newMatches = ARCHIVE_RAW.filter((p) => matchesFilters(p, newFilters));
    const unionIds = new Set([...oldMatches, ...newMatches].map((p) => p.id));
    filters = newFilters;
    archiveDisplayed = ARCHIVE_RAW.filter((p) => unionIds.has(p.id));
    archiveNewIds = new Set(newMatches.map((p) => p.id));
    clearTimeout(filterTimer);
    renderFilterBar();
    renderArchiveGrid();
    const finish = () => { archiveDisplayed = newMatches; renderArchiveGrid(); };
    if (!isReducedMotion()) filterTimer = setTimeout(finish, 300); else finish();
  }

  function renderFilterBar() {
    const allTech = [...new Set(ARCHIVE_RAW.flatMap((p) => p.tech))];
    const allDomains = [...new Set(ARCHIVE_RAW.map((p) => p.domain))];
    const statusOpts = [{ v: 'all', label: 'All' }, { v: 'shipped', label: 'Shipped' }, { v: 'in-progress', label: 'In progress' }, { v: 'archived', label: 'Archived' }];
    document.getElementById('filter-bar').innerHTML = `
      <div class="filter-row"><span class="filter-label">Tech</span>${allTech.map((t) => `<button type="button" class="chip${filters.tech.has(t) ? ' active' : ''}" data-kind="tech" data-value="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="filter-row"><span class="filter-label">Domain</span>${allDomains.map((d) => `<button type="button" class="chip${filters.domain.has(d) ? ' active' : ''}" data-kind="domain" data-value="${esc(d)}">${esc(d)}</button>`).join('')}</div>
      <div class="filter-row"><span class="filter-label">Status</span>${statusOpts.map((o) => `<button type="button" class="chip${filters.status === o.v ? ' active' : ''}" data-kind="status" data-value="${o.v}">${o.label}</button>`).join('')}</div>
    `;
  }

  function renderArchiveGrid() {
    const grid = document.getElementById('archive-grid');
    const emptyEl = document.getElementById('archive-empty');
    grid.innerHTML = archiveDisplayed.map((p) => {
      const isIn = archiveNewIds.has(p.id);
      const meta = STATUS_META[p.status];
      return `<div class="archive-card${isIn ? '' : ' hidden-out'}" data-project-id="${p.id}">
        <div class="archive-thumb media-placeholder">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <span>[shot]</span>
        </div>
        <div class="archive-card-head"><h4>${esc(p.name)}</h4><span class="status-dot" style="background:${meta.color}"></span></div>
        <div class="archive-domain">${esc(p.domain)}</div>
        <div class="archive-tags">${p.tech.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </div>`;
    }).join('');
    grid.querySelectorAll('.archive-card').forEach((card) => {
      attachTilt(card, 8);
      card.addEventListener('click', () => openProject(card.dataset.projectId));
    });
    emptyEl.hidden = archiveDisplayed.length !== 0;
  }

  // ---------- experience / education ----------
  function renderExperience() {
    document.getElementById('experience-timeline').innerHTML = EXPERIENCE.map((e) => `
      <div class="timeline-item">
        <span class="timeline-dot"></span>
        <div class="timeline-dates">${esc(e.dates)}</div>
        <h3 class="timeline-role">${esc(e.role)}</h3>
        <div class="timeline-org">${esc(e.org)}</div>
        <p class="timeline-desc">${esc(e.desc)}</p>
        <div class="timeline-tags">${e.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </div>
    `).join('');
  }
  function renderEducation() {
    document.getElementById('education-list').innerHTML = EDUCATION.map((ed) => `
      <div class="education-item">
        <div>
          <h3>${esc(ed.degree)}</h3>
          <div class="education-school">${esc(ed.school)}</div>
          <div class="education-note">${esc(ed.note)}</div>
        </div>
        <div class="education-dates">${esc(ed.dates)}</div>
      </div>
    `).join('');
  }

  // ---------- project detail routing ----------
  const ALL_PROJECTS = [
    ...FEATURED_RAW.map((p) => ({ ...p, tech: p.tags, status: 'shipped' })),
    ...ARCHIVE_RAW,
  ];
  function findProject(id) { return ALL_PROJECTS.find((p) => p.id === id) || ALL_PROJECTS[0]; }
  function openProject(id) {
    const sel = findProject(id);
    const meta = STATUS_META[sel.status] || STATUS_META.shipped;
    document.getElementById('detail-title').textContent = sel.name;
    const statusPill = document.getElementById('detail-status');
    statusPill.textContent = meta.label;
    statusPill.style.color = meta.color;
    document.getElementById('detail-tags').innerHTML = sel.tech.map((t) => `<span class="tag-chip">${esc(t)}</span>`).join('');
    document.getElementById('home-view').hidden = true;
    document.getElementById('detail-view').hidden = false;
    window.scrollTo(0, 0);
  }
  function closeProject() {
    document.getElementById('detail-view').hidden = true;
    document.getElementById('home-view').hidden = false;
  }

  // ---------- scroll effects ----------
  function onScroll() {
    const heroWrap = document.getElementById('hero-canvas-wrap');
    const r = heroWrap.getBoundingClientRect();
    scrollProgress = clamp(1 - (r.top + r.height * 0.5) / (window.innerHeight * 0.9), 0, 1);
  }

  let lenis = null;
  function initScrollFX() {
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if (isReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      revealEls.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({ autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    revealEls.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0.45, transformPerspective: 1400, rotateX: 6, scale: 0.96 },
        {
          opacity: 1, rotateX: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 38%', scrub: true },
        }
      );
    });
  }

  // ---------- init ----------
  function init() {
    renderNav();
    initMobileMenu();
    renderFeatured();
    renderFilterBar();
    renderArchiveGrid();
    renderExperience();
    renderEducation();

    document.getElementById('filter-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.chip'); if (!btn) return;
      const kind = btn.dataset.kind, value = btn.dataset.value;
      const nf = { tech: new Set(filters.tech), domain: new Set(filters.domain), status: filters.status };
      if (kind === 'tech') { nf.tech.has(value) ? nf.tech.delete(value) : nf.tech.add(value); }
      else if (kind === 'domain') { nf.domain.has(value) ? nf.domain.delete(value) : nf.domain.add(value); }
      else if (kind === 'status') { nf.status = value; }
      applyFilters(nf);
    });
    document.getElementById('back-btn').addEventListener('click', closeProject);

    initInteractions();
    initScrollFX();
    window.addEventListener('scroll', onScroll, { passive: true });
    mqReduced.addEventListener('change', () => location.reload());

    document.getElementById('hud-node-count').textContent = String(N);
    renderHero();
    renderSkills();
    if (!isReducedMotion()) startLoop();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
