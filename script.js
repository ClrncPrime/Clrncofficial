const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

window.addEventListener('load', () => {
  document.body.classList.add('page-ready');
});

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('nav-open');
  });
}

// Reveal on scroll
const observerOptions = { threshold: 0.18 };
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

const revealElements = document.querySelectorAll('section, .preview-card, .service-card, .work-card, .portfolio-card, .contact-card, .contact-info-card, .content-card, .feature-item');
revealElements.forEach((element) => {
  element.classList.add('reveal');
  revealObserver.observe(element);
});

// Highlight current nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.main-nav a');
navLinks.forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

const YT_VIDEO_ID = 'zA04SiNiLYk';

async function loadSampleWork() {
  const container = document.getElementById('dynamicSampleContainer');
  if (!container) return;
  // Static placeholder — no database integration in this restored version
  container.innerHTML = `
    <article class="work-card">
      <h2>Featured project feed</h2>
      <p>Live sample projects will appear here. This site is a static portfolio — add project cards directly in the HTML to show featured work.</p>
    </article>
  `;
}

function initAudioPlayer() {
  if (document.getElementById('floatingPlayer')) return;

  const wrap = document.createElement('div');
  wrap.id = 'floatingPlayer';
  wrap.className = 'floating-player';

  const panel = document.createElement('div');
  panel.className = 'floating-panel';
  panel.innerHTML = `
    <div class="fp-title">Lobby Music</div>
    <div class="fp-small">Ambient loop</div>
    <div class="fp-row" style="margin-top:10px; gap: 8px; flex-wrap: wrap;">
      <button class="control-btn" id="fpPlay" type="button">▶️</button>
      <button class="control-btn" id="fpPause" type="button">⏸</button>
      <button class="control-btn" id="fpStop" type="button">⏹</button>
      <button class="control-btn" id="fpRestart" type="button">🔁</button>
    </div>
    <div class="volume-wrap">
      <input id="fpVolume" class="volume-slider" type="range" min="0" max="100" value="24">
    </div>
  `;

  const btnWrap = document.createElement('div');
  btnWrap.className = 'floating-button';
  btnWrap.innerHTML = '<div class="dot"></div>';

  wrap.appendChild(panel);
  wrap.appendChild(btnWrap);
  document.body.appendChild(wrap);

  const posKey = 'floatingPlayerPos';
  const stateKey = 'floatingPlayerState';
  const timeKey = 'floatingPlayerTime';
  const volumeKey = 'floatingPlayerVolume';

  function getViewportDimensions() {
    const vv = window.visualViewport;
    return {
      width: vv?.width || window.innerWidth,
      height: vv?.height || window.innerHeight
    };
  }

  function clampPosition(left, top) {
    const minGap = 8;
    const viewport = getViewportDimensions();
    const maxLeft = viewport.width - wrap.offsetWidth - minGap;
    const maxTop = viewport.height - wrap.offsetHeight - minGap;
    return {
      left: Math.min(Math.max(minGap, left), Math.max(minGap, maxLeft)),
      top: Math.min(Math.max(minGap, top), Math.max(minGap, maxTop))
    };
  }

  function setWrapPosition(left, top) {
    wrap.style.transition = wrap.classList.contains('dragging') ? 'none' : 'left 220ms ease, top 220ms ease';
    wrap.style.left = `${left}px`;
    wrap.style.top = `${top}px`;
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
  }

  function saveWrapPosition(left, top) {
    const viewport = getViewportDimensions();
    localStorage.setItem(posKey, JSON.stringify({ x: left / viewport.width, y: top / viewport.height }));
  }

  function restoreWrapPosition() {
    const savedPos = localStorage.getItem(posKey);
    if (!savedPos) return;
    try {
      const p = JSON.parse(savedPos);
      if (typeof p.x !== 'number' || typeof p.y !== 'number') return;
      const viewport = getViewportDimensions();
      const left = Math.round(p.x * viewport.width);
      const top = Math.round(p.y * viewport.height);
      const normalized = clampPosition(left, top);
      setWrapPosition(normalized.left, normalized.top);
    } catch (e) {}
  }

  function snapToNearestEdge() {
    const rect = wrap.getBoundingClientRect();
    const viewport = getViewportDimensions();
    const left = rect.left;
    const top = rect.top;
    const right = viewport.width - rect.right;
    const bottom = viewport.height - rect.bottom;
    const distances = [
      { edge: 'left', value: left },
      { edge: 'right', value: right },
      { edge: 'top', value: top },
      { edge: 'bottom', value: bottom }
    ];
    const nearest = distances.reduce((current, item) => item.value < current.value ? item : current, distances[0]);
    let targetLeft = left;
    let targetTop = top;
    const margin = 8;
    switch (nearest.edge) {
      case 'left':
        targetLeft = margin;
        break;
      case 'right':
        targetLeft = viewport.width - wrap.offsetWidth - margin;
        break;
      case 'top':
        targetTop = margin;
        break;
      case 'bottom':
        targetTop = viewport.height - wrap.offsetHeight - margin;
        break;
    }
    const snapped = clampPosition(targetLeft, targetTop);
    setWrapPosition(snapped.left, snapped.top);
    saveWrapPosition(snapped.left, snapped.top);
  }

  restoreWrapPosition();

  let isPointerDown = false;
  let isDragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let startLeft = 0;
  let startTop = 0;
  const DRAG_THRESHOLD = 8;

  btnWrap.addEventListener('pointerdown', (ev) => {
    isPointerDown = true;
    dragMoved = false;
    isDragging = false;
    dragStartX = ev.clientX;
    dragStartY = ev.clientY;
    const rect = wrap.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    wrap.classList.add('dragging');
    wrap.style.transition = 'none';
    btnWrap.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });

  window.addEventListener('pointermove', (ev) => {
    if (!isPointerDown) return;
    const deltaX = ev.clientX - dragStartX;
    const deltaY = ev.clientY - dragStartY;
    if (!isDragging && Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD) {
      isDragging = true;
      dragMoved = true;
    }
    if (!isDragging) return;
    const position = clampPosition(startLeft + deltaX, startTop + deltaY);
    setWrapPosition(position.left, position.top);
    ev.preventDefault();
  });

  window.addEventListener('pointerup', (ev) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (isDragging) {
      isDragging = false;
      wrap.classList.remove('dragging');
      wrap.style.transition = 'left 220ms ease, top 220ms ease';
      snapToNearestEdge();
    }
    try { btnWrap.releasePointerCapture(ev.pointerId); } catch (e) {}
  });

  window.addEventListener('resize', () => {
    const rect = wrap.getBoundingClientRect();
    const normalized = clampPosition(rect.left, rect.top);
    setWrapPosition(normalized.left, normalized.top);
  });

  let open = false;
  btnWrap.addEventListener('click', (e) => {
    if (dragMoved) {
      dragMoved = false;
      return;
    }
    open = !open;
    panel.classList.toggle('open', open);
  });

  const playerContainer = document.createElement('div');
  playerContainer.id = 'ytAudioContainer';
  playerContainer.style.width = '0';
  playerContainer.style.height = '0';
  playerContainer.style.overflow = 'hidden';
  playerContainer.style.position = 'absolute';
  playerContainer.style.left = '-9999px';
  document.body.appendChild(playerContainer);

  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  let player = null;
  let playerReady = false;

  window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('ytAudioContainer', {
      height: '0',
      width: '0',
      videoId: YT_VIDEO_ID,
      playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0, showinfo: 0, loop: 1, playlist: YT_VIDEO_ID },
      events: {
        onReady: function() {
          playerReady = true;
          const volumeValue = parseInt(localStorage.getItem(volumeKey) || '24', 10);
          const volume = Math.min(Math.max(0, volumeValue), 100);
          const volumeInput = document.getElementById('fpVolume');
          if (volumeInput) volumeInput.value = String(volume);
          try { player.setVolume(volume); } catch (e) {}
          const savedState = JSON.parse(localStorage.getItem(stateKey) || 'null');
          const savedTime = parseFloat(localStorage.getItem(timeKey) || '0') || 0;
          if (savedState && savedState.playing) {
            try { player.seekTo(savedTime, true); player.playVideo(); btnWrap.classList.add('playing'); } catch (e) {}
          }
        },
        onStateChange: function(e) {
          if (e.data === YT.PlayerState.ENDED) {
            try { player.seekTo(0); player.playVideo(); } catch (e) {}
          }
        }
      }
    });
  };

  const playBtn = panel.querySelector('#fpPlay');
  const pauseBtn = panel.querySelector('#fpPause');
  const stopBtn = panel.querySelector('#fpStop');
  const restartBtn = panel.querySelector('#fpRestart');
  const vol = panel.querySelector('#fpVolume');

  function saveState(playing) {
    localStorage.setItem(stateKey, JSON.stringify({ playing: !!playing }));
  }

  function saveVolume(value) {
    localStorage.setItem(volumeKey, String(value));
  }

  function saveTime() {
    if (!player || !playerReady) return;
    try { const t = player.getCurrentTime(); localStorage.setItem(timeKey, String(t)); } catch (e) {}
  }

  playBtn.addEventListener('click', () => {
    if (!playerReady) return;
    try { player.playVideo(); saveState(true); btnWrap.classList.add('playing'); } catch (e) {}
  });

  pauseBtn.addEventListener('click', () => {
    if (!playerReady) return;
    try { player.pauseVideo(); saveState(false); btnWrap.classList.remove('playing'); } catch (e) {}
  });

  stopBtn.addEventListener('click', () => {
    if (!playerReady) return;
    try { player.stopVideo(); player.seekTo(0); saveState(false); btnWrap.classList.remove('playing'); } catch (e) {}
  });

  restartBtn.addEventListener('click', () => {
    if (!playerReady) return;
    try { player.seekTo(0); player.playVideo(); saveState(true); btnWrap.classList.add('playing'); } catch (e) {}
  });

  vol.addEventListener('input', (e) => {
    if (!playerReady) return;
    const value = parseInt(e.target.value, 10);
    if (Number.isFinite(value)) {
      try { player.setVolume(value); saveVolume(value); } catch (e) {}
    }
  });

  setInterval(() => {
    const savedState = JSON.parse(localStorage.getItem(stateKey) || 'null');
    if (savedState && savedState.playing) saveTime();
  }, 2000);

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target) && panel.classList.contains('open')) {
      panel.classList.remove('open');
      open = false;
    }
  });
}

function navigateWithTransition(url) {
  document.body.classList.add('page-exit');
  setTimeout(() => {
    window.location.href = url;
  }, 320);
}

function setupSmoothNavigation() {
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    if (!anchor) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;
    event.preventDefault();
    navigateWithTransition(url.pathname + url.search + url.hash);
  });
}

function initExperience() {
  setupSmoothNavigation();
  initAudioPlayer();
  loadSampleWork();
}

window.addEventListener('DOMContentLoaded', initExperience);

// Generic portal toggle binder for preview cards
function bindPortalToggle(cardId, portalId, linkId) {
  const card = document.getElementById(cardId);
  const portal = document.getElementById(portalId);
  const link = linkId ? document.getElementById(linkId) : null;
  if (!card || !portal) return null;

  const openPortal = () => {
    const h = portal.scrollHeight;
    portal.style.maxHeight = h + 'px';
    portal.classList.add('open');
    portal.setAttribute('aria-hidden', 'false');
    card.setAttribute('aria-expanded', 'true');
    if (link) link.textContent = 'Close';
  };

  const closePortal = () => {
    portal.style.maxHeight = '0px';
    portal.classList.remove('open');
    portal.setAttribute('aria-hidden', 'true');
    card.setAttribute('aria-expanded', 'false');
    if (link) link.textContent = 'View';
  };

  const toggle = (e) => {
    if (e) e.preventDefault();
    if (portal.classList.contains('open')) closePortal(); else openPortal();
  };

  card.style.cursor = 'pointer';
  card.addEventListener('click', toggle);
  if (link) link.addEventListener('click', (e) => { e.stopPropagation(); toggle(e); });

  return { card, portal, link, openPortal, closePortal };
}

// Bind portals for all preview cards
const portals = [
  bindPortalToggle('skillsCard', 'skillsPortal', 'skillsViewLink'),
  bindPortalToggle('servicesCard', 'servicesPortal', 'servicesViewLink'),
  bindPortalToggle('sampleCard', 'samplePortal', 'sampleViewLink'),
  bindPortalToggle('portfolioCard', 'portfolioPortal', 'portfolioViewLink')
].filter(Boolean);

// Close any open portal when clicking outside of cards/portals
document.addEventListener('click', function(e){
  portals.forEach(p => {
    if (!p) return;
    const { card, portal, closePortal } = p;
    if (portal.classList.contains('open')) {
      if (!card.contains(e.target) && !portal.contains(e.target)) {
        closePortal();
      }
    }
  });
});

