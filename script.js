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

const REASON_STORAGE_KEY = 'portfolioVisitReason';
const REASON_CONFIG = {
  portfolio: {
    label: 'View My Portfolio',
    description: 'I want to browse your work, skills, and background',
    landingPage: 'portfolio.html',
    allowedPages: ['index.html', 'portfolio.html', 'sample-work.html', ''],
  },
  services: {
    label: 'Avail Services / Hire Me',
    description: 'I am interested in your services and want to work with you',
    landingPage: 'services.html',
    allowedPages: ['index.html', 'services.html', 'contact.html', ''],
  },
};

function createWelcomeOverlay() {
  if (document.querySelector('.welcome-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'welcome-overlay';
  overlay.innerHTML = `
    <div class="welcome-panel" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle" aria-describedby="welcomeDescription">
      <div class="welcome-copy">
        <p class="eyebrow">Welcome!</p>
        <h1 id="welcomeTitle">What brings you here today?</h1>
        <p id="welcomeDescription">Choose one of the options below so I can show you the best experience.</p>
      </div>
      <div class="reason-grid">
        <button class="reason-card" data-reason="portfolio" type="button">
          <span class="reason-title">Option A — View My Portfolio</span>
          <span class="reason-text">I want to browse your work, skills, and background</span>
        </button>
        <button class="reason-card" data-reason="services" type="button">
          <span class="reason-title">Option B — Avail Services / Hire Me</span>
          <span class="reason-text">I am interested in your services and want to work with you</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelectorAll('.reason-card').forEach((button) => {
    button.addEventListener('click', () => {
      handleReasonSelection(button.dataset.reason);
    });
  });
}

function showWelcomeOverlay() {
  createWelcomeOverlay();
  document.body.classList.add('welcome-active');
  setTimeout(() => {
    document.querySelector('.welcome-overlay')?.classList.add('visible');
  }, 10);
}

function hideWelcomeOverlay() {
  const overlay = document.querySelector('.welcome-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  document.body.classList.remove('welcome-active');
}

function handleReasonSelection(reason) {
  if (!REASON_CONFIG[reason]) return;
  localStorage.setItem(REASON_STORAGE_KEY, reason);
  applyReasonFilters(reason);
  insertChangeReasonButton();
  const target = REASON_CONFIG[reason].landingPage;
  if (currentPage !== target) {
    navigateWithTransition(target);
  } else {
    hideWelcomeOverlay();
  }
}

function applyReasonFilters(reason) {
  const config = REASON_CONFIG[reason];
  navLinks.forEach((link) => {
    const page = link.getAttribute('href').split('/').pop();
    if (config.allowedPages.includes(page)) {
      link.style.display = '';
    } else {
      link.style.display = 'none';
    }
  });
}

function insertChangeReasonButton() {
  if (document.getElementById('changeReasonBtn')) return;
  const button = document.createElement('button');
  button.id = 'changeReasonBtn';
  button.className = 'change-reason-button';
  button.type = 'button';
  button.textContent = 'Change Reason';
  button.addEventListener('click', () => {
    showWelcomeOverlay();
  });
  document.body.appendChild(button);
}

function removeChangeReasonButton() {
  const button = document.getElementById('changeReasonBtn');
  if (button) button.remove();
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
    if (anchor.closest('.welcome-overlay')) return;
    event.preventDefault();
    navigateWithTransition(url.pathname + url.search + url.hash);
  });
}

function enforceReasonRedirect(reason) {
  const config = REASON_CONFIG[reason];
  if (config.allowedPages.includes(currentPage)) return;
  navigateWithTransition(config.landingPage);
}

function initExperience() {
  const savedReason = localStorage.getItem(REASON_STORAGE_KEY);
  if (savedReason && REASON_CONFIG[savedReason]) {
    applyReasonFilters(savedReason);
    insertChangeReasonButton();
    enforceReasonRedirect(savedReason);
  } else {
    showWelcomeOverlay();
  }
  setupSmoothNavigation();
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
