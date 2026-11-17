/* ============================================================
   Portfolio – Lucas Rajany
   Librairies : Vanta.js (fond), anime.js v3 (animations), Lenis (scroll)
   ============================================================ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const isMobile = window.innerWidth < 820;
  if (reduced) document.documentElement.classList.add('reduced');

  /* ── 1. LENIS : scroll fluide ───────────────────────────── */
  let lenis = null;
  const progress = document.getElementById('scroll-progress');
  const nav = document.getElementById('nav');

  function onScroll(y) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('scrolled', y > 40);
  }

  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', (e) => onScroll(e.scroll));
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    // Le scroll reste bloqué pendant l'intro
    if (document.documentElement.classList.contains('is-loading')) lenis.stop();
  } else {
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  }

  // Liens d'ancre → défilement fluide via Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -60 });
      else target.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('nav-links').classList.remove('open');
      if (lenis) lenis.start();
    });
  });

  /* ── 2. VANTA : fond animé du hero ──────────────────────── */
  let vanta = null;
  if (window.VANTA && window.THREE && !reduced) {
    try {
      vanta = VANTA.NET({
        el: '#vanta-bg',
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xa78bfa,
        backgroundColor: 0x07070d,
        points: isMobile ? 7 : 11,
        maxDistance: isMobile ? 18 : 22,
        spacing: isMobile ? 20 : 17,
        showDots: true
      });
    } catch (err) {
      console.warn('Vanta indisponible :', err);
    }
  }

  /* ── 3. Menu mobile ─────────────────────────────────────── */
  const navLinks = document.getElementById('nav-links');
  document.getElementById('nav-toggle').addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ── 4. Texte tapé (rôles) ──────────────────────────────── */
  const roles = [
    'Étudiant BTS SIO SLAM',
    'Développeur en formation',
    "Passionné d'automatisation IA",
    'Curieux de systèmes & DevOps'
  ];
  const typedEl = document.getElementById('typed');
  let ri = 0, ci = 0, deleting = false;
  function type() {
    const cur = roles[ri];
    if (!deleting) {
      typedEl.textContent = cur.slice(0, ++ci);
      if (ci === cur.length) { deleting = true; setTimeout(type, 2200); return; }
    } else {
      typedEl.textContent = cur.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(type, deleting ? 45 : 80);
  }
  type();

  /* ── 5. ANIME.JS : entrée du hero ───────────────────────── */
  // Lancée pendant la fin de l'intro (voir section 10)
  function playHero() {
    if (window.anime && !reduced) {
      anime.timeline({ easing: 'easeOutExpo' })
        .add({ targets: '.hero-badge', opacity: [0, 1], translateY: [24, 0], duration: 900 })
        .add({ targets: '.hero-last', opacity: [0, 1], translateX: [80, 0], duration: 1100 }, '-=700')
        .add({ targets: ['.hero-role', '.hero-desc'], opacity: [0, 1], translateY: [24, 0], duration: 900, delay: anime.stagger(120) }, '-=800')
        .add({ targets: ['.hero-actions', '.hero-socials'], opacity: [0, 1], translateY: [24, 0], duration: 900, delay: anime.stagger(120) }, '-=700');
    } else {
      document.querySelectorAll('.a-hero').forEach((el) => (el.style.opacity = 1));
    }
  }

  /* ── 6. ANIME.JS : révélation au scroll ─────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (window.anime && !reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        anime({
          targets: el,
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 900,
          easing: 'easeOutCubic',
          complete: () => { el.style.transform = ''; }
        });
        // Les pastilles/tags à l'intérieur apparaissent en cascade
        const kids = el.querySelectorAll('.skill-pill, .project-tag, .tag, .timeline-list li');
        if (kids.length) {
          anime({
            targets: kids,
            opacity: [0, 1],
            translateX: [-12, 0],
            duration: 600,
            delay: anime.stagger(45, { start: 250 }),
            easing: 'easeOutQuad'
          });
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => (el.style.opacity = 1));
  }

  /* ── 7. Lien actif dans la nav (scrollspy) ──────────────── */
  const sections = [...document.querySelectorAll('main section, section[id]')];
  const links = [...document.querySelectorAll('.nav-links a')];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { threshold: 0.45 });
    sections.forEach((s) => spy.observe(s));
  }

  /* ── 8. Effets souris (desktop uniquement) ──────────────── */
  if (!isTouch && !reduced) {
    // Halo qui suit le curseur
    const glow = document.getElementById('cursor-glow');
    window.addEventListener('mousemove', (e) => {
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }, { passive: true });

    // Inclinaison 3D des cartes
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + x * 7 + 'deg) rotateX(' + -y * 7 + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', () => {
        if (window.anime) {
          anime({ targets: card, rotateX: 0, rotateY: 0, translateY: 0, duration: 500, easing: 'easeOutQuad', complete: () => (card.style.transform = '') });
        } else card.style.transform = '';
      });
    });

    // Boutons « magnétiques »
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + dx * 0.25 + 'px,' + dy * 0.35 + 'px)';
      });
      btn.addEventListener('mouseleave', () => {
        if (window.anime) anime({ targets: btn, translateX: 0, translateY: 0, duration: 600, easing: 'easeOutElastic(1, .6)', complete: () => (btn.style.transform = '') });
        else btn.style.transform = '';
      });
    });
  }

  /* ── 9. Formulaire : ouvre le client mail avec le message ── */
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (id) => document.getElementById(id).value.trim();
    const subject = v('f-sujet') || 'Contact depuis le portfolio';
    const body =
      'Bonjour Lucas,\n\n' + v('f-message') +
      '\n\n— ' + v('f-prenom') + ' ' + v('f-nom') + ' (' + v('f-email') + ')';
    document.getElementById('form-msg').style.display = 'block';
    window.location.href =
      'mailto:lucas.lbruno2007@gmail.com?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    form.reset();
  });

  /* ── 10. INTRO façon lenis.dev ──────────────────────────────
     1) écran de couleur unie
     2) les lettres L-U-C-A-S apparaissent en grand (3 + 2)
     3) elles voyagent (FLIP) vers leur place dans le titre du hero
        pendant que le fond uni se retire par le bas
     ----------------------------------------------------------- */
  const intro = document.getElementById('intro');
  const root = document.documentElement;
  const heroLetters = [...document.querySelectorAll('.hero-name .hl')];

  function endIntro() {
    root.classList.remove('is-loading');
    if (intro) intro.remove();
    if (lenis) lenis.start();
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  if (!intro || !window.anime || reduced) {
    heroLetters.forEach((l) => (l.style.opacity = 1));
    endIntro();
    playHero();
  } else {
    const bg = document.getElementById('intro-bg');
    const wrappers = [...document.querySelectorAll('#intro-letters .il')];
    const glyphs = [...document.querySelectorAll('#intro-letters .il-g')];

    // On attend la police gothique + le chargement de la page (filets de sécurité)
    const fontReady = Promise.race([
      document.fonts ? document.fonts.load('900 100px "Grenze Gotisch"', 'LUCAS') : Promise.resolve(),
      new Promise((r) => setTimeout(r, 3000))
    ]);
    const pageLoaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((r) => window.addEventListener('load', r, { once: true }));
    const pageReady = Promise.race([pageLoaded, new Promise((r) => setTimeout(r, 5000))]);

    Promise.all([fontReady, pageReady]).then(() => {
      // 2) Apparition des lettres (après ~0,6 s de couleur unie)
      anime({
        targets: wrappers,
        opacity: [0, 1],
        translateY: [90, 0],
        scale: [0.88, 1],
        duration: 1000,
        delay: anime.stagger(130, { start: 600 }),
        easing: 'easeOutExpo'
      }).finished.then(() => setTimeout(fly, 450));
    });

    // 3) Les lettres rejoignent le titre, le fond se retire
    function fly() {
      const to = heroLetters.map((l) => l.getBoundingClientRect());
      const from = glyphs.map((g) => g.getBoundingClientRect());
      glyphs.forEach((g) => (g.style.transformOrigin = '0 0'));

      const flight = anime({
        targets: glyphs,
        translateX: (el, i) => to[i].left - from[i].left,
        translateY: (el, i) => to[i].top - from[i].top,
        scale: (el, i) => to[i].height / from[i].height,
        duration: 1500,
        delay: anime.stagger(70),
        easing: 'easeInOutExpo'
      });

      const wipe = { v: 0 };
      anime({
        targets: wipe, v: 100, duration: 1300, delay: 250, easing: 'easeInOutQuart',
        update: () => { bg.style.clipPath = 'inset(0 0 ' + wipe.v + '% 0)'; }
      });

      setTimeout(playHero, 1100);

      flight.finished.then(() => {
        heroLetters.forEach((l) => (l.style.opacity = 1)); // le vrai titre prend le relais
        requestAnimationFrame(endIntro);
      });
    }
  }

  // Nettoyage Vanta si la page est quittée
  window.addEventListener('beforeunload', () => { if (vanta) vanta.destroy(); });
})();
