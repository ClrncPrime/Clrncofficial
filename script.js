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
