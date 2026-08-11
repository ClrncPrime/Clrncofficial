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

  const savedPos = localStorage.getItem(posKey);
  if (savedPos) {
    try {
      const p = JSON.parse(savedPos);
      wrap.style.right = 'auto';
      wrap.style.left = `${Math.min(Math.max(8, p.x), window.innerWidth - 68)}px`;
      wrap.style.top = `${Math.min(Math.max(8, p.y), window.innerHeight - 68)}px`;
      wrap.style.bottom = 'auto';
    } catch (e) {}
  }

  let dragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  btnWrap.addEventListener('pointerdown', (ev) => {
    dragging = true;
    btnWrap.setPointerCapture(ev.pointerId);
    const rect = wrap.getBoundingClientRect();
    dragOffsetX = ev.clientX - rect.left;
    dragOffsetY = ev.clientY - rect.top;
  });

  window.addEventListener('pointermove', (ev) => {
    if (!dragging) return;
    ev.preventDefault();
    wrap.style.left = `${Math.min(Math.max(8, ev.clientX - dragOffsetX), window.innerWidth - wrap.offsetWidth)}px`;
    wrap.style.top = `${Math.min(Math.max(8, ev.clientY - dragOffsetY), window.innerHeight - wrap.offsetHeight)}px`;
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
  });

  window.addEventListener('pointerup', (ev) => {
    if (!dragging) return;
    dragging = false;
    try { btnWrap.releasePointerCapture(ev.pointerId); } catch (e) {}
    const rect = wrap.getBoundingClientRect();
    localStorage.setItem(posKey, JSON.stringify({ x: rect.left, y: rect.top }));
  });

  let open = false;
  btnWrap.addEventListener('click', (e) => {
    if (dragging) return;
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

