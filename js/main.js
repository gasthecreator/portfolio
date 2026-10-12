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

  const SITE = window.SITE;
  const FEATURED_RAW = SITE.featured.map((p) => ({ ...p, tech: p.tags, status: p.status || 'shipped' }));
  const ARCHIVE_RAW = SITE.archive;
  const EXPERIENCE = SITE.experience;
  const EDUCATION = SITE.education;

  const STATUS_META = {
    shipped: { label: 'Shipped', color: 'var(--st-shipped)' },
    'in-progress': { label: 'In progress', color: 'var(--st-progress)' },
    internal: { label: 'Internal · Solera', color: 'var(--st-progress)' },
    archived: { label: 'Archived', color: 'var(--st-archived)' },
  };

  // ---------- theme ----------
  function currentTheme() { return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
  function applyTheme(t, animate) {
    const root = document.documentElement;
    if (animate) { root.classList.add('theme-anim'); setTimeout(() => root.classList.remove('theme-anim'), 450); }
    root.dataset.theme = t;
    document.querySelectorAll('.theme-toggle').forEach((b) => {
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }
  // Day (06:00 to 18:00) is light, night is dark, by the visitor's own clock and time zone.
  // A manual choice lasts for this tab's session only; a new visit follows the time of day again.
  function themeForNow() { const h = new Date().getHours(); return h >= 6 && h < 18 ? 'light' : 'dark'; }
  function initTheme() {
    let manual = false;
    try { const s = sessionStorage.getItem('theme'); manual = s === 'light' || s === 'dark'; } catch (e) {}
    applyTheme(currentTheme(), false);
    document.querySelectorAll('.theme-toggle').forEach((b) => {
      b.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        manual = true;
        try { sessionStorage.setItem('theme', next); } catch (e) {}
        applyTheme(next, true);
      });
    });
    // If nobody has chosen, follow the clock across 06:00 and 18:00 while the page stays open.
    const follow = () => { if (!manual && themeForNow() !== currentTheme()) applyTheme(themeForNow(), true); };
    setInterval(follow, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) follow(); });
  }

  // ---------- content fill ----------
  function fillSite() {
    document.querySelectorAll('[data-site]').forEach((el) => {
      const v = SITE[el.dataset.site];
      if (typeof v === 'string') el.textContent = v;
    });
    document.getElementById('about-stats').innerHTML = SITE.stats.map((s) => `
      <div class="stat"><div class="stat-num">${esc(s.value)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join('');
    const spans = SITE.marquee.map((t) => `<span>${esc(t)}</span>`).join('');
    document.getElementById('marquee-track').innerHTML = spans + spans;
  }

  // ---------- nav ----------
  function renderNav() {
    document.getElementById('sidebar-nav').innerHTML =
      NAV_ITEMS.map((i) => `<a href="${i.href}">${esc(i.label)}</a>`).join('');
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
      <div class="stack-item" style="--i:${i}">
      <div class="project-card" data-project-id="${p.id}">
        <div class="project-card-inner${i % 2 === 1 ? ' reverse' : ''}">
          <div class="project-media metric-panel">
            <div class="project-glare" data-glare></div>
            <div class="metric-value">${esc(p.metric.value)}</div>
            <div class="metric-label">${esc(p.metric.label)}</div>
          </div>
          <div class="project-content">
            <div class="project-heading">
              <span class="project-idx">${esc(p.idx)}</span>
              <h3 class="project-name">${esc(p.name)}</h3>
            </div>
            <p class="project-tagline">${esc(p.tagline)}</p>
            <div class="tag-list">${p.tags.map((t) => `<span class="tag-chip">${esc(t)}</span>`).join('')}</div>
            <div class="project-meta">
              <div><div class="project-meta-label">Problem</div><div class="project-meta-val">${esc(p.cardProblem)}</div></div>
              <div><div class="project-meta-label">Stack</div><div class="project-meta-val">${esc(p.cardStack)}</div></div>
              <div><div class="project-meta-label">Outcome</div><div class="project-meta-val">${esc(p.cardOutcome)}</div></div>
            </div>
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
    const statusOpts = [{ v: 'all', label: 'All' }, { v: 'shipped', label: 'Shipped' }, { v: 'in-progress', label: 'In progress' }, { v: 'internal', label: 'Internal' }, { v: 'archived', label: 'Archived' }];
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
        <div class="archive-thumb metric-panel metric-panel--sm"><span class="metric-value">${esc(p.thumb)}</span></div>
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
    document.getElementById('experience-timeline').innerHTML = '<span class="timeline-line" aria-hidden="true"></span>' + EXPERIENCE.map((e) => `
      <div class="timeline-item">
        <span class="timeline-dot"></span>
        <div class="timeline-dates">${esc(e.dates)}</div>
        <h3 class="timeline-role">${esc(e.role)}</h3>
        <div class="timeline-org">${esc(e.org)}</div>
        <ul class="timeline-desc">${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
        <div class="timeline-tags">${e.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </div>
    `).join('');
  }
  function renderEducation() {
    const list = SITE.education.map((ed) => `
      <div class="education-item">
        <div class="education-main">
          <h3>${esc(ed.degree)}</h3>
          <div class="education-school">${esc(ed.school)}</div>
          <div class="education-tags">${ed.achievements.map((a) => `<span>${esc(a)}</span>`).join('')}</div>
          <p class="education-note"><strong>Coursework:</strong> ${esc(ed.coursework)}</p>
        </div>
        <div class="education-dates">${esc(ed.dates)}</div>
      </div>
    `).join('');
    document.getElementById('education-list').innerHTML = list;
    document.getElementById('education-extra').innerHTML = `
      <div class="education-group"><div class="education-group-label">Certifications</div><div class="education-tags">${SITE.certifications.map((c) => `<span>${esc(c)}</span>`).join('')}</div></div>
      <div class="education-group"><div class="education-group-label">Programs &amp; affiliations</div><div class="education-tags">${SITE.programs.map((c) => `<span>${esc(c)}</span>`).join('')}</div></div>`;
    const t = document.getElementById('transcript-btn');
    const subject = encodeURIComponent('Transcript request: Gideon Sanni');
    const body = encodeURIComponent('Hi Gideon,\n\nI would like to request a copy of your transcript.\n\nName:\nOrganization:\nPurpose:\n\nThank you.');
    t.href = `mailto:${SITE.person.email}?subject=${subject}&body=${body}`;
  }


  // ---------- résumé preview ----------
  function initResumePreview() {
    const dlg = document.getElementById('resume-dialog');
    const frame = document.getElementById('resume-frame');
    const fallback = document.getElementById('resume-fallback');
    if (!dlg || !frame) return;
    const canInline = navigator.pdfViewerEnabled !== false && !/iPhone|iPad|iPod/.test(navigator.userAgent);
    let lastFocus = null;
    const open = () => {
      lastFocus = document.activeElement;
      if (canInline) { if (!frame.src) frame.src = 'assets/resume.pdf#view=FitH'; } else { frame.hidden = true; fallback.hidden = false; }
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      dlg.showModal();
    };
    const close = () => dlg.close();
    dlg.addEventListener('close', () => {
      if (lenis) lenis.start();
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); close(); } });
    document.getElementById('resume-close').addEventListener('click', close);
    document.querySelectorAll('[data-resume-open]').forEach((b) => b.addEventListener('click', () => {
      const menu = document.getElementById('mobile-menu');
      if (menu && menu.classList.contains('open')) document.getElementById('hamburger-btn').click();
      open();
    }));
  }


  // ---------- in-page links: scroll to the section without touching the address bar ----------
  function initAnchorLinks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.getAttribute('href').length < 2) return;
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const detailOpen = !document.getElementById('detail-view').hidden;
      if (detailOpen) {
        history.replaceState(null, '', location.pathname + location.search);
        showHome();
      }
      const go = () => {
        if (id === 'hero') { if (lenis) lenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: 'smooth' }); }
        else if (lenis) lenis.scrollTo(target, { duration: 1.2 });
        else target.scrollIntoView({ behavior: 'smooth' });
      };
      if (detailOpen) setTimeout(go, 80); else go();
    });
  }


  // ---------- project gallery + lightbox ----------
  let galleryItems = [];
  let galleryIndex = 0;
  function renderGallery(p) {
    const wrap = document.getElementById('detail-gallery');
    const grid = document.getElementById('gallery-grid');
    galleryItems = p.gallery || [];
    wrap.hidden = galleryItems.length === 0;
    grid.innerHTML = galleryItems.map((g, i) => `
      <figure class="gallery-item">
        <button type="button" class="gallery-shot" data-gallery-index="${i}" aria-label="Enlarge image ${i + 1} of ${galleryItems.length}: ${esc(g.alt)}">
          <img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" decoding="async">
        </button>
        <figcaption>${esc(g.caption)}</figcaption>
      </figure>`).join('');
  }
  function initLightbox() {
    const dlg = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    const count = document.getElementById('lightbox-count');
    if (!dlg) return;
    let lastFocus = null;
    const show = (i) => {
      galleryIndex = (i + galleryItems.length) % galleryItems.length;
      const g = galleryItems[galleryIndex];
      img.src = g.src; img.alt = g.alt; cap.textContent = g.caption;
      count.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
      const multi = galleryItems.length > 1;
      document.getElementById('lightbox-prev').hidden = !multi;
      document.getElementById('lightbox-next').hidden = !multi;
    };
    document.getElementById('gallery-grid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-gallery-index]');
      if (!b) return;
      lastFocus = b;
      show(Number(b.dataset.galleryIndex));
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      dlg.showModal();
    });
    const close = () => dlg.close();
    dlg.addEventListener('close', () => {
      if (lenis) lenis.start();
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') show(galleryIndex + 1);
      else if (e.key === 'ArrowLeft') show(galleryIndex - 1);
    });
    document.getElementById('lightbox-close').addEventListener('click', close);
    document.getElementById('lightbox-prev').addEventListener('click', () => show(galleryIndex - 1));
    document.getElementById('lightbox-next').addEventListener('click', () => show(galleryIndex + 1));
  }

  // ---------- project detail routing ----------
  const ALL_PROJECTS = [...FEATURED_RAW, ...ARCHIVE_RAW];
  function findProject(id) { return ALL_PROJECTS.find((p) => p.id === id) || ALL_PROJECTS[0]; }
  let homeScrollY = 0;
  function openProject(id, fromHistory) {
    const sel = findProject(id);
    const meta = STATUS_META[sel.status] || STATUS_META.shipped;
    const set = (i, v) => { document.getElementById(i).textContent = v; };
    set('detail-title', sel.name);
    set('detail-tagline', sel.tagline);
    set('detail-problem', sel.problem);
    set('detail-approach', sel.approach);
    set('detail-stack', sel.stack);
    set('detail-outcome', sel.outcome);
    const cover = document.getElementById('detail-cover');
    cover.innerHTML = sel.metric
      ? `<div class="metric-value">${esc(sel.metric.value)}</div><div class="metric-label">${esc(sel.metric.label)}</div>`
      : `<div class="metric-value">${esc(sel.thumb || sel.name)}</div>`;
    const statusPill = document.getElementById('detail-status');
    statusPill.textContent = meta.label;
    statusPill.style.color = meta.color;
    document.getElementById('detail-tags').innerHTML = sel.tech.map((t) => `<span class="tag-chip">${esc(t)}</span>`).join('');
    renderGallery(sel);
    document.getElementById('detail-links').innerHTML = (sel.links || []).map((l) => `<a class="detail-link" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} →</a>`).join('');
    if (!fromHistory) {
      homeScrollY = window.scrollY;
      history.pushState({ project: sel.id }, '', '#project-' + sel.id);
    }
    document.getElementById('home-view').hidden = true;
    document.getElementById('detail-view').hidden = false;
    if (lenis) { lenis.resize(); lenis.scrollTo(0, { immediate: true, force: true }); }
    window.scrollTo(0, 0);
  }
  // the on-page back button and the browser's back button do the same thing: step back through history
  function closeProject() {
    if (history.state && history.state.project) history.back(); else showHome();
  }
  function showHome() {
    document.getElementById('detail-view').hidden = true;
    document.getElementById('home-view').hidden = false;
    // return to where the visitor left the list (Featured or Archive), not the top of the site
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    if (lenis) { lenis.resize(); lenis.scrollTo(homeScrollY, { immediate: true, force: true }); }
    window.scrollTo(0, homeScrollY);
  }

  window.addEventListener('popstate', (e) => {
    const id = e.state && e.state.project;
    if (id) openProject(id, true);
    else if (!document.getElementById('detail-view').hidden) showHome();
  });

  // ---------- scroll effects ----------
  let lenis = null;

  // ---------- scenery (drawn once, static) ----------
  function buildRidge(id, seed, base, amp) {
    const svg = document.getElementById(id);
    if (!svg) return;
    const ridge = (t) => 1 - Math.abs(Math.sin(t));
    let d = `M0 320 L0 ${base}`;
    for (let x = 0; x <= 1440; x += 16) {
      const y = base - amp * (0.55 * ridge(x * 0.006 + seed) + 0.3 * ridge(x * 0.015 + seed * 2.3) + 0.15 * ridge(x * 0.041 + seed * 4.1));
      d += ` L${x} ${y.toFixed(1)}`;
    }
    svg.innerHTML = `<path d="${d} L1440 320 Z"></path>`;
  }
  function buildScenery() {
    buildRidge('ridge-far', 1.3, 170, 120);
    buildRidge('ridge-mid', 4.1, 210, 100);
    buildRidge('ridge-near', 7.7, 262, 70);
    const stars = document.getElementById('stars');
    if (stars) {
      let html = '';
      let s = 7;
      const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 70; i++) {
        html += `<i style="left:${(rnd() * 100).toFixed(1)}%;top:${(rnd() * 52).toFixed(1)}%;--d:${(rnd() * 4).toFixed(2)}s;--s:${rnd() > 0.85 ? 2 : 1}px"></i>`;
      }
      stars.innerHTML = html;
    }
  }

  // ---------- scroll choreography ----------
  function initScrollFX() {
    if (isReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const hasSplitText = typeof SplitText !== 'undefined';
    gsap.registerPlugin(...(hasSplitText ? [ScrollTrigger, SplitText] : [ScrollTrigger]));
    const desktop = !isMobile();

    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({ autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    const once = (el, extra = {}) => ({ trigger: el, start: 'top 90%', once: true, ...extra });

    // SplitText can drop the space between the last words of a heading; put it back after every (re)split
    const restoreSpaces = (words) => words.forEach((w, i) => {
      const next = w.nextSibling;
      if (i < words.length - 1 && !(next && next.nodeType === 3 && /\s/.test(next.textContent))) w.after(document.createTextNode(' '));
    });

    // headings
    if (hasSplitText) {
      const heroName = document.querySelector('.hero-name');
      if (heroName) {
        SplitText.create(heroName, {
          type: 'chars', autoSplit: true,
          onSplit(self) {
            heroName.setAttribute('aria-label', 'Gideon Sanni');
            return gsap.from(self.chars, { yPercent: 110, opacity: 0, duration: 0.9, ease: 'power4.out', stagger: 0.03, delay: 0.15 });
          },
        });
      }
      document.querySelectorAll('.section-title, .contact-title').forEach((el) => {
        SplitText.create(el, {
          type: 'words', autoSplit: true,
          onSplit(self) {
            restoreSpaces(self.words);
            return gsap.from(self.words, { y: '70%', opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, scrollTrigger: once(el, { start: 'top 88%' }) });
          },
        });
      });
    }

    // generic reveals
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: once(el) });
    });
    gsap.utils.toArray('[data-stagger]').forEach((el) => {
      gsap.from(el.children, { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, scrollTrigger: once(el) });
    });
    gsap.utils.toArray('[data-clip]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.2, ease: 'power4.out', scrollTrigger: once(el, { start: 'top 85%' }) });
    });

    // full-bleed "curtain" sections grow from a rounded card into the full page width
    gsap.utils.toArray('[data-curtain]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(6% 4% 0% 4% round 44px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 30%', scrub: true },
      });
    });

    // featured cards stack and recede as the next one slides over
    const items = gsap.utils.toArray('.stack-item');
    items.forEach((item, i) => {
      const next = items[i + 1];
      if (!next || getComputedStyle(item).position !== 'sticky') return;
      gsap.to(item, { scale: 0.93, ease: 'none', scrollTrigger: { trigger: next, start: 'top 88%', end: 'top 24%', scrub: true } });
    });

    // archive cards cascade in
    ScrollTrigger.batch('.archive-card', {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.from(els, { y: 44, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, clearProps: 'all' }),
    });

    // experience: the line draws itself, entries slide in
    gsap.fromTo('.timeline-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 65%', scrub: true } });
    gsap.utils.toArray('.timeline-item').forEach((item) => {
      gsap.from(item, { x: -40, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: once(item, { start: 'top 88%' }) });
      const dot = item.querySelector('.timeline-dot');
      if (dot) gsap.from(dot, { scale: 0, duration: 0.5, ease: 'back.out(3)', scrollTrigger: once(item, { start: 'top 88%' }) });
    });

    gsap.to('.marquee-track', { xPercent: -50, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });

    // parallax
    if (desktop) {
      gsap.to('.about-image', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.skills-intro', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.skills', start: 'top bottom', end: 'center center', scrub: true } });
      gsap.utils.toArray('.blobs i').forEach((b, i) => {
        gsap.to(b, { yPercent: (i % 2 ? -1 : 1) * (18 + i * 6), ease: 'none', scrollTrigger: { trigger: b.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }
    // dusk footer: ridge layers drift at different rates
    [['#ridge-far', -10], ['#ridge-mid', -20], ['#ridge-near', -32]].forEach(([sel, y]) => {
      gsap.fromTo(sel, { yPercent: 14 }, { yPercent: y * 0.2, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    });

    // chrome: progress bar, active nav link
    gsap.to('#progress-bar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });
    const links = document.querySelectorAll('#sidebar-nav a');
    NAV_ITEMS.forEach((it, i) => {
      const sec = document.getElementById(it.id);
      if (!sec || !links[i]) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: (self) => links[i].classList.toggle('active', self.isActive) });
    });
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
    fillSite();
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

    initTheme();
    buildScenery();
    initScrollFX();
    initMicroInteractions();
    initResumePreview();
    initLightbox();
    initAnchorLinks();
    const deepLink = location.hash.match(/^#project-(.+)$/);
    if (deepLink && ALL_PROJECTS.some((p) => p.id === deepLink[1])) {
      history.replaceState(null, '', location.pathname + location.search);
      openProject(deepLink[1]);
    }
    mqReduced.addEventListener('change', () => location.reload());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
