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
