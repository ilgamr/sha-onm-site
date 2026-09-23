const menuButton=document.querySelector('.menu-toggle');
const mobileNav=document.querySelector('#mobile-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menuButton.setAttribute('aria-label',open?'Open menu':'Close menu');mobileNav.hidden=open;});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileNav.hidden){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');menuButton.focus();}});
const categoryItems = document.querySelectorAll('.category');
const expertiseVisual = document.querySelector('#expertise-visual');
let categoryImagesPrimed = false;

function primeCategoryImages() {
  if (categoryImagesPrimed) return;
  categoryImagesPrimed = true;
  categoryItems.forEach(item => {
    const source = item.dataset.image;
    if (source) { const preload = new Image(); preload.src = source; }
  });
}

function showCategoryImage(item) {
  if (!expertiseVisual) return;
  const source = item.dataset.image;
  if (!source) return;
  const current = expertiseVisual.getAttribute('src');
  if (current === source) return;
  const next = new Image();
  const apply = () => {
    expertiseVisual.classList.add('is-fading');
    window.setTimeout(() => {
      expertiseVisual.src = source;
      expertiseVisual.alt = item.dataset.alt || '';
      expertiseVisual.classList.remove('is-fading');
    }, 160);
  };
  next.decode ? next.decode().then(apply).catch(apply) : (next.onload = apply, next.onerror = apply);
  next.src = source;
}

categoryItems.forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  categoryItems.forEach(other => { if (other !== item) other.open = false; });
  showCategoryImage(item);
}));

const categoriesList = document.querySelector('.categories');
if (categoriesList) {
  ['pointerenter','focusin','touchstart'].forEach(evt =>
    categoriesList.addEventListener(evt, primeCategoryImages, { once: true, passive: true }));
}
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelector('.copy-email').addEventListener('click',async()=>{const status=document.querySelector('#copy-status');try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText('info@sha-onm.com');}else{const field=document.createElement('textarea');field.value='info@sha-onm.com';field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();const copied=document.execCommand('copy');field.remove();if(!copied)throw new Error('Clipboard unavailable');}status.textContent='Email copied';}catch{status.textContent='Select and copy: info@sha-onm.com';}});
const officeVideo = document.querySelector('#office-video');
if (officeVideo) {
  const videoButton = document.querySelector('.video-toggle');
  const videoLabel = videoButton.querySelector('.video-toggle-label');
  const videoIcon = videoButton.querySelector('.video-toggle-icon');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let userPaused = false;
  let manuallyStarted = false;
  let playbackFailed = false;

  officeVideo.muted = true;
  officeVideo.defaultMuted = true;
  videoButton.hidden = false;

  function updateVideoButton() {
    if (playbackFailed) return;
    const playing = !officeVideo.paused;
    const label = playing ? 'Pause video' : 'Play video';
    videoButton.setAttribute('aria-label', label);
    videoLabel.textContent = label;
    videoIcon.textContent = playing ? 'Ⅱ' : '▶';
  }

  function canPlayVideo() {
    return inView && !document.hidden && !userPaused && !playbackFailed && (!reducedMotion.matches || manuallyStarted);
  }

  function syncVideoPlayback() {
    if (!canPlayVideo()) {
      officeVideo.pause();
      return;
    }
    if (!officeVideo.getAttribute('src')) {
      officeVideo.src = officeVideo.dataset.src;
      officeVideo.load();
    }
    const request = officeVideo.play();
    if (request && typeof request.then === 'function') {
      request.then(() => {
        if (!canPlayVideo()) officeVideo.pause();
      }).catch(updateVideoButton);
    }
  }

  videoButton.addEventListener('click', () => {
    userPaused = !officeVideo.paused;
    if (!userPaused) manuallyStarted = true;
    syncVideoPlayback();
  });
  officeVideo.addEventListener('play', updateVideoButton);
  officeVideo.addEventListener('pause', updateVideoButton);
  officeVideo.addEventListener('error', () => {
    playbackFailed = true;
    videoLabel.textContent = 'Video unavailable';
    videoIcon.textContent = '';
    videoButton.setAttribute('aria-label', 'Video unavailable');
    videoButton.disabled = true;
  });
  document.addEventListener('visibilitychange', syncVideoPlayback);
  reducedMotion.addEventListener('change', () => {
    manuallyStarted = false;
    syncVideoPlayback();
  });

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      const entry = entries[0];
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      syncVideoPlayback();
    }, { threshold: [0, 0.2], rootMargin: '-100px 0px 0px 0px' });
    videoObserver.observe(officeVideo);
  } else {
    const checkVideoVisibility = () => {
      const bounds = officeVideo.getBoundingClientRect();
      inView = bounds.top < window.innerHeight * 0.8 && bounds.bottom > 100;
      syncVideoPlayback();
    };
    window.addEventListener('scroll', checkVideoVisibility, { passive: true });
    window.addEventListener('resize', checkVideoVisibility);
    checkVideoVisibility();
  }
}
