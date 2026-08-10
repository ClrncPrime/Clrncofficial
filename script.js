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

// Skills portal toggle (expand/collapse on Home page)
const skillsCard = document.getElementById('skillsCard');
const skillsPortal = document.getElementById('skillsPortal');
const skillsViewLink = document.getElementById('skillsViewLink');
if (skillsCard && skillsPortal) {
  // toggle function using scrollHeight for smooth transition
  const toggleSkills = (e) => {
    if (e) e.preventDefault();
    const isOpen = skillsPortal.classList.contains('open');
    if (isOpen) {
      skillsPortal.style.maxHeight = '0px';
      skillsPortal.classList.remove('open');
      skillsPortal.setAttribute('aria-hidden', 'true');
      skillsCard.setAttribute('aria-expanded', 'false');
    } else {
      // set exact height then add open class
      const h = skillsPortal.scrollHeight;
      skillsPortal.style.maxHeight = h + 'px';
      skillsPortal.classList.add('open');
      skillsPortal.setAttribute('aria-hidden', 'false');
      skillsCard.setAttribute('aria-expanded', 'true');
    }
  };

  skillsCard.style.cursor = 'pointer';
  skillsCard.addEventListener('click', toggleSkills);
  if (skillsViewLink) {
    skillsViewLink.addEventListener('click', toggleSkills);
  }
  // close when clicking outside
  document.addEventListener('click', function(e){
    if (!skillsCard.contains(e.target) && !skillsPortal.contains(e.target) && skillsPortal.classList.contains('open')) {
      // collapse
      skillsPortal.style.maxHeight = '0px';
      skillsPortal.classList.remove('open');
      skillsPortal.setAttribute('aria-hidden','true');
      skillsCard.setAttribute('aria-expanded','false');
    }
  });
}
