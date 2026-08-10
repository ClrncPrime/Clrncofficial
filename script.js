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

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      alert('Please enter all required information.');
      return;
    }

    alert(`Thank you, ${name}! Your message has been received. I will reply as soon as possible.`);
    contactForm.reset();
  });
}

function createRipple(target, x, y) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.1;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x - rect.left - size / 2}px`;
  ripple.style.top = `${y - rect.top - size / 2}px`;
  target.appendChild(ripple);

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

function applyPressEffect(target) {
  if (!target) return;
  target.classList.add('press-active');
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      target.classList.remove('press-active');
    }, 240);
  });
}

function attachInteractiveGlow(element) {
  if (!element) return;

  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'touch') {
      applyPressEffect(element);
      createRipple(element, event.clientX, event.clientY);
    }
  });
}

const interactiveSelectors = [
  'button',
  'a',
  '.preview-card',
  '.service-card',
  '.work-card',
  '.portfolio-card',
  '.contact-card',
  '.contact-info-card',
  '.content-card',
  '.feature-item',
  '.menu-toggle'
];

interactiveSelectors.forEach((selector) => {
  document.querySelectorAll(selector).forEach((element) => {
    attachInteractiveGlow(element);
  });
});

const observerOptions = {
  threshold: 0.18,
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

const revealElements = document.querySelectorAll(
  'section, .preview-card, .service-card, .work-card, .portfolio-card, .contact-card, .contact-info-card, .content-card, .feature-item'
);

revealElements.forEach((element) => {
  element.classList.add('reveal');
  revealObserver.observe(element);
});

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.main-nav a');
navLinks.forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});
