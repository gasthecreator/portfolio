(function () {
  'use strict';

  // ---------- helpers ----------
  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
    function open() { menu.classList.add('open'); btn.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    function close() { menu.classList.remove('open'); btn.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', () => (menu.classList.contains('open') ? close() : open()));
    menu.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
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
  let lenis = null;
  function initScrollFX() {
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if (isReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      revealEls.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    const hasSplitText = typeof SplitText !== 'undefined';
    gsap.registerPlugin(...(hasSplitText ? [ScrollTrigger, SplitText] : [ScrollTrigger]));

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

    if (hasSplitText) {
      const heroName = document.querySelector('.hero-name');
      if (heroName) {
        SplitText.create(heroName, {
          type: 'chars', autoSplit: true,
          onSplit(self) {
            return gsap.from(self.chars, { y: '110%', opacity: 0, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.025 });
          },
        });
      }
      document.querySelectorAll('.section-title, .contact-title').forEach((el) => {
        SplitText.create(el, {
          type: 'words', autoSplit: true,
          onSplit(self) {
            return gsap.from(self.words, {
              y: '60%', opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            });
          },
        });
      });
    }

    if (!isMobile()) {
      gsap.to('.about-image', {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.to('.skills-intro', {
        yPercent: -14, ease: 'none',
        scrollTrigger: { trigger: '.skills', start: 'top bottom', end: 'center center', scrub: true },
      });
    }
  }

  // ---------- micro-interactions ----------
  function initMicroInteractions() {
    if (typeof anime === 'undefined') return;
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('pointerdown', () => {
        if (isReducedMotion()) return;
        anime.animate(btn, { scale: 0.94, duration: 120, ease: 'outQuad' });
      });
      ['pointerup', 'pointerleave'].forEach((evt) => {
        btn.addEventListener(evt, () => {
          if (isReducedMotion()) return;
          anime.animate(btn, { scale: 1, duration: 320, ease: 'outElastic(1, .6)' });
        });
      });
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
      if (!isReducedMotion() && typeof anime !== 'undefined') {
        const fresh = document.querySelector(`.chip[data-kind="${kind}"][data-value="${value}"]`);
        if (fresh) anime.animate(fresh, { scale: [1, 1.12, 1], duration: 320, ease: 'outElastic(1, .6)' });
      }
    });
    document.getElementById('back-btn').addEventListener('click', closeProject);

    initScrollFX();
    initMicroInteractions();
    mqReduced.addEventListener('change', () => location.reload());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
