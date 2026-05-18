// ===== Révélation universelle au scroll =====
(function () {
  const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

  // Éléments individuels (pas de stagger interne)
  const SINGLES = [
    '.section-h', '.subsection-h',
    '.about-prose > p', '.about-langues',
    '.vid-gallery',
    '.formations-cta', '.footer-inner', '.footer-bottom',
    '.t-tabs',
  ];

  // Groupes avec stagger entre enfants du même parent
  const STAGGER = [
    { sel: '.entries > .entry',        ms: 100 },
    { sel: '.entries > .entry-fiche',  ms: 110 },
    { sel: '.t-list > .t-card',        ms:  80 },
    { sel: '.formation-grid .formation-item', ms: 130 },
    { sel: '.vid-reel-track .vid-reel-card',  ms: 150 },
    { sel: '.formations-list .formation',     ms: 120 },
    { sel: '.lang-flags .lang-flag',          ms:  60 },
    { sel: '.about-meta > .about-block',      ms: 160 },
  ];

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      const delay = +(target.dataset.revealDelay || 0);
      setTimeout(() => target.classList.add('anim-visible'), delay);
      obs.unobserve(target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

  function reg(el, delay = 0) {
    if (el.classList.contains('anim-reveal')) return; // pas de double-enregistrement
    el.classList.add('anim-reveal');
    el.dataset.revealDelay = delay;
    obs.observe(el);
  }

  SINGLES.forEach(sel => document.querySelectorAll(sel).forEach(el => reg(el)));

  STAGGER.forEach(({ sel, ms }) => {
    const byParent = new Map();
    document.querySelectorAll(sel).forEach(el => {
      const p = el.parentElement;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(el);
    });
    byParent.forEach(kids =>
      kids.forEach((el, i) => reg(el, Math.min(i * ms, 700)))
    );
  });
})();


// Now Playing — effet typewriter
(function () {
  const card = document.querySelector('.np-card');
  if (!card) return;
  const label = card.querySelector('.np-label');
  const lis = Array.from(card.querySelectorAll('.np-list li'));

  // Extraire le texte "Now playing" et vider le nœud texte
  let twText = '';
  label.childNodes.forEach(node => {
    if (node.nodeType === 3) { twText += node.textContent; node.textContent = ''; }
  });
  twText = twText.trim();
  const textSpan = document.createElement('span');
  label.appendChild(textSpan);

  function typewrite(done) {
    const cursor = document.createElement('span');
    cursor.className = 'np-tw-cursor';
    label.appendChild(cursor);
    let i = 0;
    function tick() {
      if (i < twText.length) {
        textSpan.textContent += twText[i++];
        setTimeout(tick, 72 + Math.random() * 35);
      } else {
        setTimeout(() => { cursor.remove(); done(); }, 600);
      }
    }
    setTimeout(tick, 250);
  }

  function revealLis() {
    lis.forEach((li, i) => {
      setTimeout(() => li.classList.add('np-li-visible'), i * 620);
    });
  }

  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    typewrite(revealLis);
  }, { threshold: 0.3 });
  obs.observe(card);
})();

// Galerie vidéos pédagogiques — lecture à la demande
document.querySelectorAll('.vid-thumb').forEach(el => {
  el.addEventListener('click', () => {
    if (el.classList.contains('lyt-active')) return;
    const vid = el.dataset.vid;
    el.classList.add('lyt-active');
    el.insertAdjacentHTML('beforeend', `<iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1&playsinline=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border:0"></iframe>`);
  });
});

// Nav transparente / dark adaptative selon section
const nav = document.getElementById('nav');
const darkSections = document.querySelectorAll('.section.dark, footer');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  // Détecter si on est sur une section dark
  const navMid = nav.getBoundingClientRect().bottom;
  let onDark = false;
  darkSections.forEach(s => {
    const rect = s.getBoundingClientRect();
    if (rect.top <= navMid && rect.bottom >= navMid) onDark = true;
  });
  nav.classList.toggle('on-dark', onDark);
}, { passive: true });

// Liens externes : nouvelle fenêtre + tag UTM portfolio
(function () {
  const lang = document.documentElement.lang.toLowerCase();
  const utmValue = lang === 'fr' ? 'portfolio_sylingual_FR' : 'portfolio_sylingual_EN';
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    if (href.startsWith('http')) {
      try {
        const url = new URL(href);
        url.searchParams.set('utm_source', utmValue);
        a.setAttribute('href', url.toString());
      } catch (_) {}
    }
  });
})();

// Hamburger menu mobile
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
function closeMobileMenu() {
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
burger.addEventListener('click', () => {
  const isOpen = burger.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
  mobileMenu.classList.toggle('open', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

// Nav active link tracking
const sections = ['about', 'cat-1', 'cat-2', 'cat-3', 'formations', 'temoignages'];
const navLinks = {};
document.querySelectorAll('.nav-links a').forEach(a => {
  const h = a.getAttribute('href');
  if (h && h.startsWith('#')) navLinks[h.slice(1)] = a;
});
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < 120) current = id;
  });
  Object.entries(navLinks).forEach(([id, a]) => {
    a.classList.toggle('active', id === current);
  });
}, { passive: true });

// Tabs témoignages
const tTabs = document.querySelectorAll('.t-tab');
const allTCards = document.querySelectorAll('.t-card');
tTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;
    tTabs.forEach(t => t.classList.toggle('active', t === tab));
    allTCards.forEach(card => {
      const matches = filter === 'all' || card.dataset.tcat === filter;
      card.classList.toggle('t-filtered-out', !matches);
    });
    if (tExpanded) {
      tExpanded = false;
      tHiddenCards.forEach(card => {
        card.classList.remove('t-revealing');
        card.classList.add('t-hidden');
      });
      tMore.classList.remove('expanded');
    }
    updateMoreBtn();
  });
});

// Témoignages voir plus / moins
const tMore = document.getElementById('t-more');
const tMoreRow = tMore.closest('.t-more-row');
const tHiddenCards = [...document.querySelectorAll('.t-card.t-hidden')];
let tExpanded = false;

function updateMoreBtn() {
  if (tExpanded) {
    tMoreRow.style.display = '';
    tMore.querySelector('.lbl').textContent = 'Replier les témoignages';
    return;
  }
  const count = tHiddenCards.filter(c => !c.classList.contains('t-filtered-out')).length;
  tMoreRow.style.display = count === 0 ? 'none' : '';
  if (count > 0) {
    const s = count > 1 ? 's' : '';
    tMore.querySelector('.lbl').textContent = `Voir les ${count} autre${s} témoignage${s}`;
  }
}

updateMoreBtn();

tMore.addEventListener('click', () => {
  tExpanded = !tExpanded;
  tHiddenCards.forEach(card => {
    if (tExpanded) {
      card.classList.remove('t-hidden');
      card.classList.add('t-revealing');
    } else {
      card.classList.remove('t-revealing');
      card.classList.add('t-hidden');
    }
  });
  tMore.classList.toggle('expanded', tExpanded);
  updateMoreBtn();
  if (!tExpanded) {
    document.getElementById('temoignages').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// Hero — parallaxe 2D au survol de la section entière
const heroSection = document.querySelector('.hero');
const heroVisual  = heroSection?.querySelector('.hero-photo img, .hero-photo video');
if (heroVisual) {
  heroSection.addEventListener('mousemove', e => {
    const r = heroSection.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    heroVisual.style.transition = 'none';
    heroVisual.style.transform  = `translate(${x * 18}px, ${y * 12}px)`;
  });
  heroSection.addEventListener('mouseleave', () => {
    heroVisual.style.transition = 'transform 0.7s cubic-bezier(0.03,0.98,0.52,0.99)';
    heroVisual.style.transform  = '';
  });
}

// Lettre footer : 1er tap = animation, 2e tap = ouverture email (mobile uniquement)
(function () {
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  const mailLink = document.querySelector('.footer-cta a[href^="mailto"]');
  if (!mailLink) return;
  const letterImage = mailLink.querySelector('.letter-image');
  if (!letterImage) return;
  mailLink.addEventListener('click', function (e) {
    if (!letterImage.classList.contains('is-open')) {
      e.preventDefault();
      letterImage.classList.add('is-open');
    }
  });
})();
