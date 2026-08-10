const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

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
      alert('Pakilagay ang lahat ng kinakailangang impormasyon.');
      return;
    }

    alert(`Salamat, ${name}! Natanggap ang iyong mensahe. Sasagutin kita sa lalong madaling panahon.`);
    contactForm.reset();
  });
}
