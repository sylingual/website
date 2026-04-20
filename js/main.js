/* ==========================================================
   SYLINGUAL.COM — main.js (version finale)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. NAVIGATION
  ---------------------------------------------------------- */
  const nav      = document.getElementById('nav');
  const hero     = document.getElementById('hero');
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  function syncNav() {
    const past = hero ? hero.getBoundingClientRect().bottom <= 0 : true;
    nav.classList.toggle('scrolled', past);
    nav.classList.toggle('on-dark',  !past);
  }
  nav.classList.add('on-dark');
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  toggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.querySelectorAll('span').forEach((s, i) => {
      s.style.transform = open
        ? (i === 0 ? 'rotate(45deg) translate(1px, 6px)'
         : i === 1 ? 'scaleX(0)'
         : 'rotate(-45deg) translate(1px, -6px)')
        : '';
      s.style.opacity = (open && i === 1) ? '0' : '1';
    });
  });

  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      toggle?.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '1';
      });
    });
  });

  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  function syncActiveLink() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', syncActiveLink, { passive: true });

  /* ----------------------------------------------------------
     2. SMOOTH SCROLL
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id     = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     3. HERO PARTICULES
  ---------------------------------------------------------- */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let pts   = [];

    function resizeCanvas() {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    function mkParticle() {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        r: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -(Math.random() * 0.4 + 0.12),
        maxA: Math.random() * 0.32 + 0.04,
        life: 0,
        maxLife: Math.random() * 320 + 140
      };
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      while (pts.length < 72) pts.push(mkParticle());
      pts = pts.filter(p => p.life < p.maxLife);
      pts.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const t = p.life / p.maxLife;
        const a = t < 0.15 ? (t / 0.15) * p.maxA
                : t > 0.8  ? ((1 - t) / 0.2) * p.maxA
                : p.maxA;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168,216,210,' + a.toFixed(3) + ')';
        ctx.fill();
      });
      requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    animateParticles();
  }

  /* ----------------------------------------------------------
     4. PARALLAX HERO
  ---------------------------------------------------------- */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && hero) {
    function parallaxHero() {
      const scrolled = window.scrollY;
      const limit    = hero.offsetHeight;
      if (scrolled < limit) {
        const ratio = scrolled / limit;
        heroContent.style.transform = 'translateY(' + (scrolled * 0.22) + 'px)';
        heroContent.style.opacity   = Math.max(0, 1 - ratio * 1.6).toFixed(3);
      }
    }
    window.addEventListener('scroll', parallaxHero, { passive: true });
  }

  /* ----------------------------------------------------------
     5. SCROLL REVEAL — stagger par grille
  ---------------------------------------------------------- */
  const GRID_CLASSES = ['real-grid', 'anecdotes-grid', 'ap-stats', 'articles-grid', 'anecdotes-grid'];

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const parent = el.parentElement;

      if (parent) {
        const isGrid    = GRID_CLASSES.some(c => parent.classList.contains(c));
        const siblings  = [...parent.querySelectorAll('.fade-up')];
        const idx       = siblings.indexOf(el);
        const baseDelay = el.classList.contains('delay-1') ? 0.1
                        : el.classList.contains('delay-2') ? 0.2
                        : el.classList.contains('delay-3') ? 0.3
                        : el.classList.contains('delay-4') ? 0.4 : 0;
        const extra     = isGrid ? idx * 0.07 : 0;
        el.style.transitionDelay = (baseDelay + extra).toFixed(2) + 's';
      }

      el.classList.add('visible');
      revealObs.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => revealObs.observe(el));

  /* ----------------------------------------------------------
     6. TILT 3D CARTES
  ---------------------------------------------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    document.querySelectorAll('.real-card, .anecdote-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 9).toFixed(2) + 'deg) rotateX(' + (-y * 9).toFixed(2) + 'deg) translateY(-5px)';
        card.style.boxShadow = (-x * 14).toFixed(1) + 'px ' + (y * 14).toFixed(1) + 'px 40px rgba(0,0,0,0.14)';
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  /* ----------------------------------------------------------
     7. CARTE LEAFLET
  ---------------------------------------------------------- */
  const mapEl = document.getElementById('map');
  if (typeof L !== 'undefined' && mapEl) {
    const map = L.map('map', {
      center:             [28, 18],
      zoom:               2,
      zoomControl:        false,
      attributionControl: false,
      scrollWheelZoom:    false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom:    18
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({
      position: 'bottomright',
      prefix: '<a href="https://carto.com" target="_blank">CartoDB</a> &middot; <a href="https://openstreetmap.org" target="_blank">OSM</a>'
    }).addTo(map);

    const locations = [
      { lat: 48.650, lng:  21.574, label: 'Kosice, Slovaquie',          desc: 'Stage M2 - Alliance Francaise',                 year: '2026',      type: 'fle',          cat: 'FLE' },
      { lat: 47.640, lng:   6.863, label: 'Belfort, France',             desc: 'Stage M1 - Centre Culturel de la Pepiniere',    year: '2023',      type: 'fle',          cat: 'FLE' },
      { lat: 47.996, lng:   0.197, label: 'Le Mans, France',             desc: 'Master Didactique des Langues',                  year: '2022/2026', type: 'formation',    cat: 'Formation' },
      { lat: 49.443, lng:   1.099, label: 'Rouen, France',               desc: 'Licence Sciences du Langage, FLE',               year: '2022',      type: 'formation',    cat: 'Formation' },
      { lat: 47.214, lng:  -1.558, label: 'Nantes, France',              desc: 'Diplome Ingenieur - Centrale Nantes',            year: '2018',      type: 'formation',    cat: 'Formation' },
      { lat: 35.994, lng: -78.899, label: 'Durham, Etats-Unis',          desc: 'Master of Engineering - Duke University',        year: '2018',      type: 'formation',    cat: 'Formation' },
      { lat: 37.775, lng:-122.419, label: 'San Francisco, Etats-Unis',   desc: 'Product Owner - Tech industry',                  year: '2019/2022', type: 'pro',          cat: 'Experience' },
      { lat: 48.857, lng:   2.352, label: 'Paris, France',               desc: 'Stage Conseil - DXC Technology',                 year: '2017',      type: 'pro',          cat: 'Experience' },
      { lat: 36.107, lng: 120.383, label: 'Qingdao, Chine',              desc: 'Stage Informatique - ThyssenKrupp',              year: '2016',      type: 'pro',          cat: 'Experience' },
      { lat:-33.653, lng: -78.831, label: 'Ile Robinson Crusoe, Chili',  desc: "Volontariat - Lenovo Work for Humankind",        year: '2022',      type: 'volunteer',    cat: 'Volontariat' },
      { lat: 21.307, lng:-157.858, label: 'Hawaii, Etats-Unis',          desc: "Conseil d'admin - PARENTS",                      year: '2021/2024', type: 'volunteer',    cat: 'Volontariat' },
      { lat: 34.694, lng: 135.502, label: 'Osaka, Japon',                desc: "Sejour linguistique - famille d'accueil",        year: '2011',      type: 'linguistique', cat: 'Linguistique' },
      { lat: 39.904, lng: 116.407, label: 'Pekin, Chine',                desc: 'Beihang University - Mandarin',                  year: '2016',      type: 'linguistique', cat: 'Linguistique' },
      { lat: 37.567, lng: 126.978, label: 'Seoul, Coree du Sud',         desc: 'Working Holiday Visa - Sogang University',       year: '2024/2025', type: 'linguistique', cat: 'Linguistique' },
      { lat: 43.710, lng: -79.400, label: 'Toronto, Canada',             desc: 'Sejour linguistique',                            year: '2010',      type: 'linguistique', cat: 'Linguistique' },
      { lat: 40.417, lng:  -3.704, label: 'Madrid, Espagne',             desc: 'Sejour linguistique',                            year: '2010',      type: 'linguistique', cat: 'Linguistique' },
    ];

    locations.forEach(loc => {
      const icon = L.divIcon({
        className:  '',
        html:       '<div class="marker-pin ' + loc.type + '"></div>',
        iconSize:   [12, 12],
        iconAnchor: [6, 6],
        popupAnchor:[0, -10]
      });
      const popup = L.popup({ closeButton: true, maxWidth: 240 }).setContent(
        '<div class="popup-inner">' +
        '<div class="popup-label">' + loc.cat + ' &middot; ' + loc.year + '</div>' +
        '<div class="popup-title">' + loc.label + '</div>' +
        '<div class="popup-desc">' + loc.desc + '</div>' +
        '</div>'
      );
      L.marker([loc.lat, loc.lng], { icon }).bindPopup(popup).addTo(map);
    });

    setTimeout(() => map.invalidateSize(), 400);
  }

  /* ----------------------------------------------------------
     8. FORMULAIRE CONTACT — Netlify Forms
  ---------------------------------------------------------- */
  const form    = document.getElementById('contact-form');
  const formMsg = document.getElementById('form-message');

  if (form && formMsg) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn    = form.querySelector('.form-submit');
      const orig   = btn.textContent;
      btn.textContent = 'Envoi...';
      btn.disabled    = true;

      try {
        const res = await fetch('/', {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    new URLSearchParams(new FormData(form)).toString()
        });

        if (res.ok) {
          form.reset();
          formMsg.textContent = 'Message envoye. Je vous reponds tres bientot !';
          formMsg.style.color = 'var(--canard-mid)';
          btn.textContent     = 'Envoye !';
        } else {
          throw new Error('server');
        }
      } catch {
        formMsg.textContent = 'Erreur. Ecrivez directement a mayer.cynthia.ko@gmail.com';
        formMsg.style.color = 'salmon';
        btn.textContent     = orig;
        btn.disabled        = false;
      }
    });
  }

  /* ----------------------------------------------------------
     9. ARTICLES RSS via rss2json
  ---------------------------------------------------------- */
  const feeds = [
    {
      id:  'feed-atelier',
      url: 'https://atelierdufrancaisparis.com/author/cynthia/feed/',
      fallback: [
        { title: "L'IA peut-elle remplacer le professeur de FLE ?",         date: '2026-03', link: 'https://atelierdufrancaisparis.com/author/cynthia/' },
        { title: "ChatGPT en classe : guide pratique pour les enseignants", date: '2026-02', link: 'https://atelierdufrancaisparis.com/author/cynthia/' },
        { title: "Creer des exercices personnalises avec l'IA generative",  date: '2025-11', link: 'https://atelierdufrancaisparis.com/author/cynthia/' },
        { title: "Correction automatique : avantages et limites en FLE",    date: '2025-09', link: 'https://atelierdufrancaisparis.com/author/cynthia/' },
      ]
    },
    {
      id:  'feed-upbraining',
      url: 'https://upbraining.net/blog/feed/',
      fallback: [
        { title: "Comment apprendre plus vite grace aux neurosciences",            date: '2024-10', link: 'https://upbraining.net/blog' },
        { title: "La methode des intervalles espaces appliquee aux langues",       date: '2024-06', link: 'https://upbraining.net/blog' },
        { title: "Construire un curriculum de langue efficace",                    date: '2023-12', link: 'https://upbraining.net/blog' },
        { title: "Engagement et motivation : retenir l'attention des apprenants",  date: '2023-08', link: 'https://upbraining.net/blog' },
      ]
    }
  ];

  function renderFeed(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    const months = ['jan.','fev.','mars','avr.','mai','juin','juil.','aout','sept.','oct.','nov.','dec.'];
    el.innerHTML = items.map(item => {
      let dateStr = '';
      if (item.pubDate) {
        dateStr = new Date(item.pubDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      } else if (item.date) {
        const parts = item.date.split('-');
        dateStr = months[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
      }
      const href = item.link || '#';
      return '<li class="feed-item"><a href="' + href + '" target="_blank" rel="noopener noreferrer">' + item.title + '</a>' + (dateStr ? '<time>' + dateStr + '</time>' : '') + '</li>';
    }).join('');
  }

  feeds.forEach(function(feed) {
    var api = 'https://api.rss2json.com/v1/api.json?count=4&rss_url=' + encodeURIComponent(feed.url);
    fetch(api)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.status === 'ok' && data.items && data.items.length) {
          renderFeed(feed.id, data.items.slice(0, 4));
        } else {
          renderFeed(feed.id, feed.fallback);
        }
      })
      .catch(function() {
        renderFeed(feed.id, feed.fallback);
      });
  });

});
