import './style.css'

// ===== Configuration =====
let activeFormat = 'hex';
let toastTimeout = null;

// ===== Color Conversion Utilities =====
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r},${g},${b})`;
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)},${Math.round(s * 100)}%,${Math.round(l * 100)}%)`;
}

function formatColor(hex, twClass) {
  switch (activeFormat) {
    case 'rgb': return hexToRgb(hex);
    case 'hsl': return hexToHsl(hex);
    case 'tw': return twClass || hex;
    default: return hex;
  }
}

// ===== Toast System =====
function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-msg');
  if (!toast || !msg) return;

  // Clear existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  msg.textContent = message;
  toast.classList.remove('hidden', 'toast-exit');
  toast.classList.add('flex', 'toast-enter');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => {
      toast.classList.remove('flex', 'toast-exit');
      toast.classList.add('hidden');
    }, 400);
  }, 2000);
}

// ===== Feature 1: Single-Click Copy =====
document.addEventListener('click', (e) => {
  const swatch = e.target.closest('.swatch');
  if (swatch) {
    const hex = swatch.getAttribute('data-hex');
    const twClass = swatch.getAttribute('data-class');
    if (hex) {
      const value = formatColor(hex, twClass);
      navigator.clipboard.writeText(value).then(() => {
        showToast(`Copied: ${value}`);
      });
    }
  }
});

// ===== Feature 2: Format Toggle =====
const formatBtns = document.querySelectorAll('.format-btn');
formatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    activeFormat = btn.dataset.format;

    // Update active button
    formatBtns.forEach(b => {
      b.classList.remove('active');
      b.classList.add('text-surface-500');
    });
    btn.classList.add('active');
    btn.classList.remove('text-surface-500');

    // Update visible hex labels only on palette swatches (not strategy cards)
    document.querySelectorAll('#palette .swatch').forEach(swatch => {
      const hex = swatch.getAttribute('data-hex');
      const twClass = swatch.getAttribute('data-class');
      if (!hex) return;
      const hexLabel = swatch.querySelector('span.font-mono');
      if (hexLabel) {
        hexLabel.textContent = formatColor(hex, twClass);
      }
    });
  });
});

// ===== Feature 3: Scroll-Triggered Reveal Animations =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal, .reveal-children').forEach(el => {
  revealObserver.observe(el);
});

// ===== Feature 4: Scroll Spy (Active Nav Highlighting) =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        if (link.dataset.section === id) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });
}, {
  threshold: 0,
  rootMargin: '-80px 0px -60% 0px'
});

sections.forEach(section => spyObserver.observe(section));

// ===== Feature 5: Copy Entire Palette Row =====
document.querySelectorAll('.copy-all-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.palette-group');
    if (!group) return;

    const swatches = group.querySelectorAll('.swatch[data-hex]');
    const colors = [];

    swatches.forEach(swatch => {
      const hex = swatch.getAttribute('data-hex');
      const twClass = swatch.getAttribute('data-class');
      colors.push(formatColor(hex, twClass));
    });

    if (activeFormat === 'tw') {
      navigator.clipboard.writeText(colors.join('\n')).then(() => {
        showToast(`Copied ${colors.length} Tailwind classes`);
      });
    } else {
      const output = colors.join(', ');
      navigator.clipboard.writeText(output).then(() => {
        showToast(`Copied ${colors.length} colors`);
      });
    }
  });
});

// ===== Feature 6: Keyboard Navigation =====
const allSwatches = Array.from(document.querySelectorAll('#palette .swatch'));

// Make swatches focusable
allSwatches.forEach(s => {
  if (!s.getAttribute('tabindex')) s.setAttribute('tabindex', '0');
});

document.addEventListener('keydown', (e) => {
  const focused = document.activeElement;
  const idx = allSwatches.indexOf(focused);

  if (idx === -1) return;

  let nextIdx = -1;

  switch (e.key) {
    case 'ArrowRight':
      nextIdx = Math.min(idx + 1, allSwatches.length - 1);
      e.preventDefault();
      break;
    case 'ArrowLeft':
      nextIdx = Math.max(idx - 1, 0);
      e.preventDefault();
      break;
    case 'ArrowDown': {
      // Try to move to the same position in the next row
      const grid = focused.closest('.grid');
      if (!grid) break;
      const siblings = Array.from(grid.querySelectorAll('.swatch'));
      const posInGrid = siblings.indexOf(focused);
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      const nextInGrid = posInGrid + cols;
      if (nextInGrid < siblings.length) {
        nextIdx = allSwatches.indexOf(siblings[nextInGrid]);
      }
      e.preventDefault();
      break;
    }
    case 'ArrowUp': {
      const grid = focused.closest('.grid');
      if (!grid) break;
      const siblings = Array.from(grid.querySelectorAll('.swatch'));
      const posInGrid = siblings.indexOf(focused);
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      const prevInGrid = posInGrid - cols;
      if (prevInGrid >= 0) {
        nextIdx = allSwatches.indexOf(siblings[prevInGrid]);
      }
      e.preventDefault();
      break;
    }
    case 'Enter':
    case ' ': {
      const hex = focused.getAttribute('data-hex');
      const twClass = focused.getAttribute('data-class');
      if (hex) {
        const value = formatColor(hex, twClass);
        navigator.clipboard.writeText(value).then(() => {
          showToast(`Copied: ${value}`);
        });
      }
      e.preventDefault();
      break;
    }
    case 'Escape':
      focused.blur();
      break;
  }

  if (nextIdx >= 0 && nextIdx < allSwatches.length) {
    allSwatches[nextIdx].focus();
  }
});

// ===== Feature 7: Back to Top Button =====
const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  // Show/hide based on scroll position
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        backToTop.classList.remove('visible');
      } else {
        backToTop.classList.add('visible');
      }
    });
  }, { threshold: 0 });

  // Observe the top of the page (rules section)
  const rulesSection = document.getElementById('rules');
  if (rulesSection) scrollObserver.observe(rulesSection);

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Mobile Menu Toggle =====
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

// ===== Feature 9: Dark Mode Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('theme-icon-moon');
const sunIcon = document.getElementById('theme-icon-sun');

function setTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    moonIcon?.classList.add('hidden');
    sunIcon?.classList.remove('hidden');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    moonIcon?.classList.remove('hidden');
    sunIcon?.classList.add('hidden');
    localStorage.setItem('theme', 'light');
  }
}

// Initialize from localStorage or system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  setTheme(true);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(!isDark);
  });
}

// ===== Feature 10: WCAG Contrast Badges =====
function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const srgb = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

document.querySelectorAll('#palette .swatch').forEach(swatch => {
  const hex = swatch.getAttribute('data-hex');
  if (!hex) return;

  const lum = getLuminance(hex);

  // ── Adaptive text color based on luminance ──
  // Light swatches (lum > 0.35) get dark text; dark swatches get white text
  const useDarkText = lum > 0.35;
  const textColor = useDarkText ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.95)';
  const mutedColor = useDarkText ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.65)';

  swatch.querySelectorAll('span.font-bold').forEach(el => {
    el.style.color = textColor;
  });
  swatch.querySelectorAll('span.font-mono').forEach(el => {
    el.style.color = mutedColor;
  });

  // ── WCAG Contrast Badge ──
  // Shows contrast ratio of this color used as a background vs the best text color
  const contrastWhite = getContrastRatio(hex, '#FFFFFF');
  const contrastBlack = getContrastRatio(hex, '#000000');
  const bestContrast = Math.max(contrastWhite, contrastBlack);
  const bestTextColor = contrastWhite > contrastBlack ? 'white' : 'black';
  const ratio = bestContrast.toFixed(1);

  const badge = document.createElement('span');
  badge.className = 'contrast-badge absolute top-1 right-1 text-[7px] font-bold tracking-wider px-1 rounded-sm opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200 pointer-events-none z-20 shadow-sm text-white';

  if (bestContrast >= 7) {
    badge.textContent = `${ratio}:1 AAA`;
    badge.classList.add('bg-green-500/90');
  } else if (bestContrast >= 4.5) {
    badge.textContent = `${ratio}:1 AA`;
    badge.classList.add('bg-brand-blue-500/90');
  } else if (bestContrast >= 3) {
    badge.textContent = `${ratio}:1 AA+`;
    badge.classList.add('bg-brand-blue-500/90');
  } else {
    badge.textContent = `${ratio}:1 ✗`;
    badge.classList.add('bg-red-500/80');
  }

  // Badge tooltip: explain what the ratio means
  badge.title = `Best text: ${bestTextColor} (${ratio}:1 contrast ratio)`;

  swatch.appendChild(badge);
});

// ===== Feature 11: Search & Filter Colors =====
const searchInput = document.getElementById('color-search');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const groups = document.querySelectorAll('.palette-group');

    groups.forEach(group => {
      const swatches = group.querySelectorAll('.swatch');
      let visibleCount = 0;

      swatches.forEach(swatch => {
        const hex = (swatch.getAttribute('data-hex') || '').toLowerCase();
        const twClass = (swatch.getAttribute('data-class') || '').toLowerCase();
        const shade = swatch.querySelector('.font-bold')?.textContent || '';
        const groupTitle = group.querySelector('h3')?.textContent.toLowerCase() || '';

        const match = !query
          || hex.includes(query)
          || twClass.includes(query)
          || shade.includes(query)
          || groupTitle.includes(query);

        if (match) {
          swatch.classList.remove('filtered-out');
          visibleCount++;
        } else {
          swatch.classList.add('filtered-out');
        }
      });

      if (visibleCount === 0 && query) {
        group.classList.add('filtered-out');
      } else {
        group.classList.remove('filtered-out');
      }
    });
  });
}

// ===== Feature 12: Export Palette =====
const exportBtn = document.getElementById('export-btn');
const exportMenu = document.getElementById('export-menu');

if (exportBtn && exportMenu) {
  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', () => {
    exportMenu.classList.remove('open');
  });

  exportMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  function getAllColors() {
    const colors = {};
    document.querySelectorAll('#palette .palette-group').forEach(group => {
      const title = group.querySelector('h3')?.textContent.trim().toLowerCase().replace(/\s+/g, '-') || 'unknown';
      colors[title] = {};
      group.querySelectorAll('.swatch').forEach(swatch => {
        const hex = swatch.getAttribute('data-hex');
        const shade = swatch.querySelector('.font-bold')?.textContent || '500';
        if (hex) colors[title][shade] = hex;
      });
    });
    return colors;
  }

  exportMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.export;
      const colors = getAllColors();
      let output = '';

      if (format === 'css') {
        output = ':root {\n';
        for (const [family, shades] of Object.entries(colors)) {
          for (const [shade, hex] of Object.entries(shades)) {
            output += `  --color-${family}-${shade}: ${hex};\n`;
          }
          output += '\n';
        }
        output += '}';
      } else if (format === 'json') {
        output = JSON.stringify(colors, null, 2);
      } else if (format === 'tailwind') {
        output = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
        for (const [family, shades] of Object.entries(colors)) {
          output += `        '${family}': {\n`;
          for (const [shade, hex] of Object.entries(shades)) {
            output += `          '${shade}': '${hex}',\n`;
          }
          output += `        },\n`;
        }
        output += '      },\n    },\n  },\n};';
      }

      navigator.clipboard.writeText(output).then(() => {
        showToast(`Exported as ${format.toUpperCase()} — copied!`);
        exportMenu.classList.remove('open');
      });
    });
  });
}

// ===== Feature 13: Scroll Progress Bar =====
const progressBar = document.getElementById('scroll-progress');

if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });
}