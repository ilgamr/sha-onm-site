/* Shanghai O&M — Projects globe */
(() => {
  'use strict';
  const DATA = window.PROJECTS || [];
  const $ = s => document.querySelector(s);
  const byId = Object.fromEntries(DATA.map(p => [p.id, p]));
  const CAT = {
    factory: { label: 'Factory', icon: 'i-factory' },
    inspection: { label: 'Inspection & test', icon: 'i-inspect' },
    shipment: { label: 'Shipment', icon: 'i-ship' },
    product: { label: 'Product', icon: 'i-box' },
    visit: { label: 'Visit & delegation', icon: 'i-visit' }
  };
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const fmtDate = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
  const tileSrc = id => `../assets/projects/t/${id}.webp`;
  const cardSrc = id => `../assets/projects/c/${id}.webp`;
  const mqPhone = window.matchMedia('(max-width: 720px)');
  const mqWide = window.matchMedia('(min-width: 1101px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Header menu (same behaviour as the main page) ---------- */
  const menuButton = $('.menu-toggle'), mobileNav = $('#mobile-nav');
  const setMenu = open => { menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); mobileNav.hidden = !open; };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  $('#year').textContent = new Date().getFullYear();
  

  /* ---------- Orders ---------- */
  function shuffled(arr, seed) {
    const a = arr.slice(); let s = seed >>> 0;
    const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const globeOrder = shuffled(DATA, 20261006);
  const byDate = DATA.slice().sort((a, b) => b.y - a.y || a.id.localeCompare(b.id));
  let filter = 'all';
  let list = byDate;
  let current = null;

  /* ---------- Globe geometry ---------- */
  const globe = $('#globe'), sphere = $('#sphere');
  const ROWS = 15, STEP = 11, RAD = Math.PI / 180;
  function buildRows(n) {
    const lats = Array.from({ length: ROWS }, (_, i) => ((ROWS - 1) / 2 - i) * STEP);
    const cos = lats.map(l => Math.cos(l * RAD));
    const sum = cos.reduce((a, b) => a + b, 0);
    const counts = cos.map(c => Math.max(2, Math.round(n * c / sum)));
    let diff = n - counts.reduce((a, b) => a + b, 0);
    const order = lats.map((_, i) => i).sort((a, b) => Math.abs(lats[a]) - Math.abs(lats[b]));
    for (let k = 0; diff !== 0 && k < 1000; k++) {
      const i = order[k % ROWS];
      if (diff > 0) { counts[i]++; diff--; } else if (counts[i] > 2) { counts[i]--; diff++; }
    }
    return lats.map((lat, i) => ({ lat, n: counts[i] }));
  }
  const rows = buildRows(globeOrder.length);
  const tiles = [];
  {
    let k = 0;
    rows.forEach((row, ri) => {
      const span = 180 / row.n, offset = (ri % 2) * span / 2;
      for (let j = 0; j < row.n && k < globeOrder.length; j++, k++) {
        const p = globeOrder[k];
        const el = document.createElement('div');
        el.className = 'tile'; el.dataset.id = p.id;
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'tile-in'; btn.tabIndex = -1;
        const img = new Image();
        img.decoding = 'async'; img.alt = ''; img.draggable = false;
        img.onload = () => img.classList.add('is-loaded');
        img.src = tileSrc(p.id);
        btn.appendChild(img); el.appendChild(btn); sphere.appendChild(el);
        tiles.push({ el, p, lat: row.lat, lon0: -90 + (j + 0.5) * span + offset, n: row.n, lastOp: -1 });
      }
    });
  }
  const tileById = Object.fromEntries(tiles.map(t => [t.p.id, t]));

  let R = 280;
  function layout() {
    const size = globe.clientWidth || 600;
    globe.style.setProperty('--size', size + 'px');
    R = size * 0.455;
    const baseW = R * 0.235, maxH = R * STEP * RAD * 0.86;
    tiles.forEach(t => {
      const arc = R * Math.cos(t.lat * RAD) * Math.PI / t.n;
      const w = Math.min(baseW, arc * 0.9), h = Math.min(w * 0.74, maxH);
      t.el.style.setProperty('--w', w.toFixed(1) + 'px');
      t.el.style.setProperty('--h', h.toFixed(1) + 'px');
    });
    render(true);
  }

  /* ---------- Rotation ---------- */
  const BASE_SPEED = 3.4; // degrees per second
  let rot = 0, speed = reduced.matches ? 0 : BASE_SPEED, target = speed;
  let hovering = false, dragging = false, inView = true, flying = null;
  const wrap = d => ((d + 90) % 180 + 180) % 180 - 90;

  function render(force) {
    for (const t of tiles) {
      const lon = wrap(t.lon0 + rot);
      const z = Math.cos(t.lat * RAD) * Math.cos(lon * RAD);
      let op = (z - 0.03) / 0.22; op = op < 0 ? 0 : op > 1 ? 1 : op;
      t.lon = lon; t.op = op;
      if (op === 0) {
        if (t.lastOp !== 0 || force) { t.el.style.visibility = 'hidden'; t.el.style.opacity = '0'; t.lastOp = 0; }
        continue;
      }
      if (t.lastOp === 0 || force) t.el.style.visibility = '';
      t.el.style.transform = `rotateY(${lon.toFixed(3)}deg) rotateX(${t.lat}deg) translateZ(${R.toFixed(1)}px)`;
      if (Math.abs(op - t.lastOp) > 0.01 || force) { t.el.style.opacity = op.toFixed(3); t.lastOp = op; }
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (flying) {
      const k = Math.min(1, (now - flying.start) / flying.dur);
      const e = 1 - Math.pow(1 - k, 3);
      rot = flying.from + flying.delta * e;
      if (k >= 1) flying = null;
      render();
    } else if (!dragging) {
      target = (reduced.matches || hovering || current) ? 0 : BASE_SPEED;
      speed += (target - speed) * Math.min(1, dt * 3.2);
      if (Math.abs(speed) > 0.002) { rot += speed * dt; render(); }
    }
    if (current) updateLink();
    if (inView && !document.hidden) requestAnimationFrame(frame); else running = false;
  }
  let running = false;
  function start() { if (!running && inView && !document.hidden) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', start);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { inView = es[0].isIntersecting; start(); }, { threshold: 0 }).observe(globe);
  }

  function flyTo(id) {
    const t = tileById[id]; if (!t) return;
    const goal = mqWide.matches ? 18 : 0; // a little right of centre, towards the card
    const lon = wrap(t.lon0 + rot);
    let delta = goal - lon;
    if (reduced.matches) { rot += delta; render(); return; }
    flying = { from: rot, delta, start: performance.now(), dur: 650 + Math.abs(delta) * 6 };
    speed = 0; start();
  }

  /* ---------- Pointer: hover, drag to spin, click ---------- */
  let down = null;
  globe.addEventListener('pointerover', e => { if (e.pointerType === 'mouse' && e.target.closest('.tile')) hovering = true; });
  globe.addEventListener('pointerout', e => { if (e.pointerType === 'mouse' && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.tile'))) hovering = false; });
  globe.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    down = { x: e.clientX, y: e.clientY, rot, t: performance.now(), lastX: e.clientX, lastT: performance.now(), v: 0, id: e.pointerId, tile: e.target.closest('.tile') };
  });
  globe.addEventListener('pointermove', e => {
    if (!down || e.pointerId !== down.id) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!dragging) {
      if (Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy)) {
        dragging = true; flying = null; globe.classList.add('is-dragging');
        try { globe.setPointerCapture(e.pointerId); } catch (_) {}
      } else if (Math.abs(dy) > 10) { down = null; return; }
    }
    if (dragging) {
      const now = performance.now();
      rot = down.rot + (dx / R) / RAD * 0.9;
      const inst = ((e.clientX - down.lastX) / R) / RAD * 0.9 / Math.max(0.008, (now - down.lastT) / 1000);
      down.v = down.v * 0.6 + inst * 0.4; down.lastX = e.clientX; down.lastT = now;
      render(); start();
    }
  });
  const endPointer = e => {
    if (!down) return;
    if (dragging) {
      dragging = false; globe.classList.remove('is-dragging');
      speed = Math.max(-120, Math.min(120, down.v || 0));
    } else if (e.type === 'pointerup') {
      const t = down.tile || nearestTile(e.clientX, e.clientY);
      if (t) open(t.dataset.id, { fromGlobe: true });
    }
    down = null; start();
  };
  function nearestTile(x, y) {
    let best = null, bd = 900; // within 30px
    for (const t of tiles) {
      if (t.op < 0.5 || t.el.classList.contains('is-dim')) continue;
      const r = t.el.firstChild.getBoundingClientRect();
      const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = t.el; }
    }
    return best;
  }
  globe.addEventListener('pointerup', endPointer);
  globe.addEventListener('pointercancel', endPointer);
  globe.addEventListener('dragstart', e => e.preventDefault());

  /* ---------- Strip & filters ---------- */
  const strip = $('#strip');
  function renderStrip() {
    strip.innerHTML = '';
    const frag = document.createDocumentFragment();
    list.forEach(p => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.id = p.id;
      b.setAttribute('aria-label', `${p.t} — ${p.y}`);
      if (current && current.id === p.id) b.setAttribute('aria-current', 'true');
      const img = document.createElement('img');
      img.loading = 'lazy'; img.decoding = 'async'; img.alt = ''; img.width = 200; img.height = 150;
      img.src = tileSrc(p.id);
      b.appendChild(img); li.appendChild(b); frag.appendChild(li);
    });
    strip.appendChild(frag);
    strip.scrollLeft = 0;
    updateStripButtons();
  }
  strip.addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (b) open(b.dataset.id, { fly: true, reveal: true }); });
  const sPrev = $('#strip-prev'), sNext = $('#strip-next');
  function updateStripButtons() {
    sPrev.disabled = strip.scrollLeft < 4;
    sNext.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
  }
  strip.addEventListener('scroll', () => requestAnimationFrame(updateStripButtons), { passive: true });
  sPrev.addEventListener('click', () => strip.scrollBy({ left: -strip.clientWidth * 0.85, behavior: 'smooth' }));
  sNext.addEventListener('click', () => strip.scrollBy({ left: strip.clientWidth * 0.85, behavior: 'smooth' }));

  const filterBtns = document.querySelectorAll('#filters button');
  filterBtns.forEach(b => {
    const f = b.dataset.filter;
    b.addEventListener('click', () => setFilter(f));
  });
  function setFilter(f) {
    filter = f;
    filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    list = f === 'all' ? byDate : byDate.filter(p => p.c === f);
    tiles.forEach(t => t.el.classList.toggle('is-dim', f !== 'all' && t.p.c !== f));
    renderStrip();
    if (current) updateCount();
  }

  /* ---------- Card ---------- */
  const panel = $('.pj-panel'), card = $('#pj-card'), media = $('#card-media');
  const cImg = $('#card-img'), cBg = $('#card-img-bg'), backdrop = $('#pj-backdrop');
  const link = $('#pj-link'), linkPath = $('#pj-link-path'), linkDot = $('#pj-link-dot');
  let lastFocus = null, closeTimer = 0, openedAt = 0;

  function updateCount() {
    const i = list.findIndex(p => p.id === current.id);
    const total = list.length;
    $('#card-count').textContent = i >= 0 ? `${String(i + 1).padStart(2, '0')} / ${total}` : `— / ${total}`;
  }

  function fill(p) {
    const cat = CAT[p.c];
    $('#card-cat').innerHTML = `<svg aria-hidden="true"><use href="#${cat.icon}"/></svg>${cat.label}`;
    $('#card-title').textContent = p.t;
    const time = $('#card-date'); time.dateTime = String(p.y); time.textContent = p.y;
    $('#card-desc').textContent = p.d;
    $('#card-product').textContent = p.p;
    $('#card-stage').textContent = p.s;
    const ratio = Math.max(1, Math.min(1.5, p.w / p.h));
    media.style.aspectRatio = ratio.toFixed(3);
    media.classList.add('is-loading');
    cBg.src = tileSrc(p.id);
    cImg.onload = () => media.classList.remove('is-loading');
    cImg.alt = p.t;
    cImg.width = p.w; cImg.height = p.h;
    cImg.src = cardSrc(p.id);
    if (cImg.complete) media.classList.remove('is-loading');
    updateCount();
  }

  function markActive(id) {
    tiles.forEach(t => t.el.classList.toggle('is-active', t.p.id === id));
    strip.querySelectorAll('button[aria-current]').forEach(b => b.removeAttribute('aria-current'));
    const sb = strip.querySelector(`button[data-id="${id}"]`);
    if (sb) {
      sb.setAttribute('aria-current', 'true');
      const r = sb.getBoundingClientRect(), sr = strip.getBoundingClientRect();
      if (r.left < sr.left || r.right > sr.right) strip.scrollTo({ left: sb.parentElement.offsetLeft - strip.clientWidth / 2 + sb.clientWidth / 2, behavior: 'smooth' });
    }
  }

  function open(id, opts = {}) {
    const p = byId[id]; if (!p) return;
    const wasOpen = !!current;
    current = p;
    if (!wasOpen) lastFocus = document.activeElement;
    clearTimeout(closeTimer);
    fill(p);
    markActive(id);
    panel.classList.add('has-card');
    card.hidden = false;
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
    openedAt = performance.now();
    if (mqPhone.matches) {
      backdrop.hidden = false;
      requestAnimationFrame(() => { card.classList.add('is-open'); backdrop.classList.add('is-on'); });
      document.documentElement.style.overflow = 'hidden';
      card.scrollTop = 0;
    }
    if (opts.fly || !opts.fromGlobe) flyTo(id);
    if (!mqPhone.matches && opts.reveal) {
      const r = card.getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight) card.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest' });
    }
    try { history.replaceState(null, '', '#' + id); } catch (_) {}
    if (!wasOpen && (mqPhone.matches || opts.focus)) $('#card-close').focus({ preventScroll: true });
    start();
  }

  function close() {
    if (!current) return;
    current = null;
    tiles.forEach(t => t.el.classList.remove('is-active'));
    strip.querySelectorAll('button[aria-current]').forEach(b => b.removeAttribute('aria-current'));
    link.classList.remove('is-on');
    const done = () => { card.hidden = true; panel.classList.remove('has-card'); backdrop.hidden = true; };
    if (mqPhone.matches) {
      card.classList.remove('is-open'); backdrop.classList.remove('is-on');
      document.documentElement.style.overflow = '';
      closeTimer = setTimeout(done, 340);
    } else done();
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
    if (lastFocus && document.contains(lastFocus) && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    start();
  }

  function step(dir) {
    if (!current) return;
    let i = list.findIndex(p => p.id === current.id);
    if (i < 0) i = dir > 0 ? -1 : 0;
    const next = list[(i + dir + list.length) % list.length];
    if (next) open(next.id, { fly: true });
  }
  $('#card-close').addEventListener('click', close);
  $('#card-prev').addEventListener('click', () => step(-1));
  $('#card-next').addEventListener('click', () => step(1));
  backdrop.addEventListener('click', () => { if (performance.now() - openedAt > 450) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!mobileNav.hidden) { setMenu(false); menuButton.focus(); } else close(); }
    if (!current || /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  mqPhone.addEventListener('change', () => { if (current) { const id = current.id; close(); card.hidden = true; panel.classList.remove('has-card'); backdrop.hidden = true; card.classList.remove('is-open'); open(id); } });

  /* Dashed connector from the selected photo to the card (wide screens) */
  const stage = $('.pj-stage');
  function updateLink() {
    const t = current && tileById[current.id];
    if (!t || !mqWide.matches || card.hidden || t.op < 0.35 || t.el.classList.contains('is-dim')) { link.classList.remove('is-on'); return; }
    const sr = stage.getBoundingClientRect();
    const tr = t.el.firstChild.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    const x1 = tr.right - sr.left, y1 = tr.top + tr.height / 2 - sr.top;
    const x2 = cr.left - sr.left - 2, y2 = Math.min(cr.top + 90, cr.bottom - 40) - sr.top;
    if (x2 - x1 < 24) { link.classList.remove('is-on'); return; }
    const mx = x1 + (x2 - x1) * 0.55;
    linkPath.setAttribute('d', `M${x1.toFixed(1)},${y1.toFixed(1)} C${mx.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
    linkDot.setAttribute('cx', x2.toFixed(1)); linkDot.setAttribute('cy', y2.toFixed(1));
    link.classList.add('is-on');
  }

  /* ---------- Init ---------- */
  if ('ResizeObserver' in window) new ResizeObserver(() => layout()).observe(globe);
  window.addEventListener('resize', () => { layout(); updateStripButtons(); });
  renderStrip();
  layout();
  start();
  const fromHash = location.hash.slice(1);
  if (byId[fromHash]) setTimeout(() => open(fromHash, { fly: true }), 300);
})();
