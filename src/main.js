import './style.css'

// Copy Functionality
document.addEventListener('dblclick', (e) => {
  const swatch = e.target.closest('.swatch');
  if (swatch) {
    const hex = swatch.getAttribute('data-hex');
    if (hex) {
      navigator.clipboard.writeText(hex).then(() => {
        const toast = document.getElementById('toast');
        const msg = document.getElementById('toast-msg');
        if (toast && msg) {
          msg.textContent = `Copied: ${hex}`;
          toast.classList.remove('hidden');
          toast.classList.add('flex');
          setTimeout(() => {
            toast.classList.remove('flex');
            toast.classList.add('hidden');
          }, 2000);
        }
      });
    }
  }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    if (isHidden) {
      mobileMenu.classList.remove('hidden');
      menuIcon?.setAttribute('d', 'M6 18L18 6M6 6l12 12'); // X icon
    } else {
      mobileMenu.classList.add('hidden');
      menuIcon?.setAttribute('d', 'M4 6h16M4 12h16m-7 6h7'); // Hamburger icon
    }
  });

  // Close menu when clicking a link
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuIcon?.setAttribute('d', 'M4 6h16M4 12h16m-7 6h7');
    });
  });
}