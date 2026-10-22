/* ==========================================================================
   L’intemporelle Brest — mise en scène (GSAP + ScrollTrigger + Lenis)
   Règles : transform / opacity pour l’essentiel, courbes power3 / expo,
   prefers-reduced-motion respecté, effets lourds allégés sur mobile.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('js'); return; }
  gsap.registerPlugin(ScrollTrigger);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const PHONE = '+33763510324';
  const body = document.body;

  /* ───────────────────────── Ongles dessinés (SVG) ─────────────────────────
     Un « nuancier » vectoriel : chaque finition est dessinée, pas photographiée.
     Pour des photos réelles : remplacer le contenu de [data-nailset]. */
  const NAIL = 'M50 2C60 2 68 18 75 44C81 66 86 90 86 116C86 142 78 157 62 158L38 158C22 157 14 142 14 116C14 90 19 66 25 44C32 18 40 2 50 2Z';
  const FILL = { nude: 'g-nude', french: 'g-nude', chrome: 'g-chrome', cat: 'g-cat', ombre: 'g-ombre', gem: 'g-nude', noir: 'g-noir', fleur: 'g-milk', rose: 'g-rose', milk: 'g-milk', gold: 'g-gold' };
  const GLOSS = '<path d="M30 46C24 72 22 100 26 128" stroke="#fff" stroke-opacity=".45" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="68" cy="34" rx="3.6" ry="9" fill="#fff" opacity=".4" transform="rotate(14 68 34)"/>';
  const flower = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-5" rx="3.2" ry="5" fill="#fff" stroke="#E7BDB0" stroke-width=".5" transform="rotate(${a})"/>`).join('')}<circle r="2.4" fill="#C9A15B"/></g>`;
  const gem = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g-gem)" stroke="#C9A15B" stroke-width=".9"/><circle cx="${x - r * .3}" cy="${y - r * .35}" r="${r * .22}" fill="#fff"/>`;

  function face(style, i) {
    switch (style) {
      case 'french': return '<path d="M0 0H100V42Q50 66 0 42Z" fill="#FFF8F1"/><path d="M0 42Q50 66 100 42" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>';
      case 'chrome': return '<path d="M-10 118L110 34" stroke="#fff" stroke-opacity=".75" stroke-width="11"/><path d="M-10 146L110 62" stroke="#fff" stroke-opacity=".38" stroke-width="5"/><path d="M-10 70L80 6" stroke="#B9A4DC" stroke-opacity=".35" stroke-width="8"/>';
      case 'cat': return `<rect x="-30" y="${58 + (i % 2) * 8}" width="160" height="30" fill="url(#g-streak)" transform="rotate(${-34 + i * 2} 50 80)"/>`;
      case 'gem': return gem(50, 124, 7) + gem(34, 112, 4) + gem(66, 112, 4) + '<circle cx="50" cy="96" r="2.4" fill="#fff" opacity=".9"/><circle cx="42" cy="100" r="1.6" fill="#fff" opacity=".8"/>';
      case 'noir': return '<path d="M8 112Q50 92 92 112" fill="none" stroke="url(#g-gold)" stroke-width="2.4"/><path d="M8 122Q50 102 92 122" fill="none" stroke="url(#g-gold)" stroke-width=".9"/><circle cx="50" cy="60" r="1.8" fill="#C9A15B"/>';
      case 'fleur': return [flower(36 + (i % 2) * 6, 58, .85), flower(64 - (i % 2) * 6, 104, 1.05), '<circle cx="64" cy="64" r="1.6" fill="#C9A15B"/><circle cx="32" cy="108" r="1.4" fill="#C9A15B"/>'].join('');
      case 'gold': return '<path d="M-10 100L110 20" stroke="#fff" stroke-opacity=".4" stroke-width="9"/>';
      default: return '';
    }
  }

  const nailG = (style, i, cx, cy, rot, s) =>
    `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(-50 -80)"><g clip-path="url(#nailClip)"><rect width="100" height="160" fill="url(#${FILL[style] || 'g-nude'})"/>${face(style, i)}<path d="M12 134Q50 108 88 134V160H12Z" fill="#fff" opacity=".16"/>${GLOSS}</g><path d="${NAIL}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/></g>`;

  const HAND = [[50, 206, -10, .7], [118, 154, -4, .84], [190, 130, 1, .93], [258, 160, 8, .82], [222, 312, 24, .98]];
  const hand = style => `<svg viewBox="-10 20 320 380" aria-hidden="true" focusable="false">${HAND.map((n, i) => nailG(style, i, ...n)).join('')}</svg>`;
  const single = style => `<svg viewBox="0 0 100 160" aria-hidden="true" focusable="false">${nailG(style, 0, 50, 80, 0, 1)}</svg>`;

  $$('[data-nailset]').forEach(el => { el.innerHTML = hand(el.dataset.nailset); });
  $$('[data-nail]').forEach(el => { el.innerHTML = single(el.dataset.nail); });

  /* ───────────────────────── Split text ───────────────────────── */
  function splitEl(el, chars) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const wrap = node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
          const wi = document.createElement('span'); wi.className = 'wi';
          if (chars) [...p].forEach(ch => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; wi.appendChild(c); });
          else wi.textContent = p;
          w.appendChild(wi); frag.appendChild(w);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') [...node.childNodes].forEach(wrap);
    };
    [...el.childNodes].forEach(wrap);
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = label + ' ';
    el.prepend(sr);
    return { inners: chars ? $$('.c', el) : $$('.wi', el) };
  }

  const splits = new Map();
  $$('[data-split]').forEach(el => splits.set(el, splitEl(el, el.dataset.split === 'chars')));
  const heroChars = $$('.hero__title .c');
  gsap.set(heroChars, { yPercent: 118 });
  // titres de section : on masque avant l’apparition, puis on révèle au scroll
  splits.forEach((s, el) => { if (!el.closest('.hero')) gsap.set(s.inners, { yPercent: 112 }); el.style.visibility = 'visible'; });

  /* ───────────────────────── Smooth scroll ───────────────────────── */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const goTo = (target, offset = 0) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (target === 0 || target === '#top') { lenis ? lenis.scrollTo(0, { duration: 1.8 }) : scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (!el) return;
    lenis ? lenis.scrollTo(el, { offset, duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    if (a.hasAttribute('data-menu-link')) closeMenu();
    goTo(id === '#top' ? 0 : t, id === '#rdv' || id === '#infos' ? 0 : 0);
    history.replaceState(null, '', id);
  }));
  $('#toTop').addEventListener('click', () => goTo(0));

  /* ───────────────────────── Navigation ───────────────────────── */
  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
  let menuOpen = false, navHidden = false;
  function openMenu() {
    menuOpen = true; menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Fermer le menu');
    lenis && lenis.stop(); body.classList.add('is-locked'); if (navHidden) { navHidden = false; gsap.to(nav, { yPercent: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }); }
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false; menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Ouvrir le menu');
    lenis && lenis.start(); body.classList.remove('is-locked');
  }
  burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  matchMedia('(min-width: 980px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      if (menuOpen) return;
      const hide = self.direction === 1 && y > 320;
      if (hide !== navHidden) { navHidden = hide; gsap.to(nav, { yPercent: hide ? -110 : 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' }); }
    }
  });
  gsap.to('#progressBar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

  /* ───────────────────────── Préchargeur + entrée ───────────────────────── */
  const loader = $('#loader');
  const hero = $('.hero');

  function heroIn() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo('.hero__stage', { scale: 1.22 }, { scale: 1, duration: 2.6 }, 0)
      .from('.hero__hand svg', { y: 160, opacity: 0, rotate: -10, duration: 2, ease: 'power3.out' }, 0.1)
      .from('.fnail', { scale: 0, opacity: 0, duration: 1.6, stagger: 0.14 }, 0.5)
      .from('.hero__eyebrow', { opacity: 0, x: -30, duration: 1.2 }, 0.3)
      .to(heroChars, { yPercent: 0, duration: 1.5, stagger: { each: 0.04, from: 'start' } }, 0.25)
      .fromTo('.hero-anim', { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.3, stagger: 0.12 }, 0.95)
      .from(nav, { y: -28, opacity: 0, duration: 1.2 }, 0.9)
      .add(() => { lenis && !menuOpen && lenis.start(); body.classList.remove('is-locked'); startHeroMotion(); }, 1.2);
  }

  function runLoader() {
    body.classList.add('is-locked');
    if (reduce) {
      loader.remove();
      gsap.set(heroChars, { yPercent: 0 });
      gsap.set('.hero-anim', { opacity: 1 });
      body.classList.remove('is-locked');
      return;
    }
    const num = $('#loaderNum');
    const st = { v: 0 };
    gsap.set('.loader__fill', { yPercent: 101 });
    const progress = gsap.timeline();
    progress
      .from('.loader__brand', { y: 26, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0.1)
      .from('.loader__count', { opacity: 0, duration: 0.8 }, 0.3)
      .to('.loader__stroke', { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 0)
      .to('.loader__fill', { yPercent: 0, duration: 2, ease: 'power2.inOut' }, 0.35)
      .to(st, { v: 100, duration: 2, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(st.v); } }, 0.35);

    const ready = Promise.race([
      Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))]),
      new Promise(r => setTimeout(r, 6000))
    ]);

    Promise.all([ready, new Promise(r => progress.eventCallback('onComplete', r))]).then(() => {
      const edge = $('.loader__edge').getBoundingClientRect().height;
      const S = Math.max(innerWidth, innerHeight) / 34;
      const exit = gsap.timeline({ onComplete: () => { loader.remove(); ScrollTrigger.refresh(); } });
      exit.to('.loader__brand,.loader__count', { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in' })
        .to('.loader__nail', { scale: S, duration: 1.15, ease: 'expo.in' }, 0.05)
        .add(heroIn, '>-0.05')
        .to('.loader__slide', { y: -(innerHeight + edge + 4), duration: 1.25, ease: 'expo.inOut' }, '<');
    });
  }

  /* ───────────────────────── Hero : parallax, souris, flottement ───────────────────────── */
  const wide = () => innerWidth >= 900;
  $$('.hero__layer').forEach(layer => {
    const d = parseFloat(layer.dataset.depth);
    gsap.to(layer, {
      y: () => (1 - d) * innerHeight * (wide() ? 0.4 : 0.22), ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    });
  });
  gsap.to('.hero__content', { yPercent: -10, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: hero, start: '15% top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__badge', { rotate: 120, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  let heroMotionOn = false;
  function startHeroMotion() {
    if (heroMotionOn || reduce) return;
    heroMotionOn = true;
    gsap.to('.hero__hand', { y: -16, rotate: 1.2, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    $$('.fnail').forEach(el => gsap.to(el, { y: 'random(-18,18)', rotation: '+=random(-10,10)', duration: 'random(2.6,4.6)', ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    if (!fine) return;
    const groups = [['.hero__hand svg', 34], ['.fnail svg', -60], ['.spark', 90], ['.bokeh', -40], ['.hero__almond', 24]];
    const setters = groups.flatMap(([sel, amp]) => $$(sel).map(el => ({ qx: gsap.quickTo(el, 'x', { duration: 1.4, ease: 'power3' }), qy: gsap.quickTo(el, 'y', { duration: 1.4, ease: 'power3' }), amp })));
    hero.addEventListener('pointermove', e => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      setters.forEach(s => { s.qx(nx * s.amp); s.qy(ny * s.amp); });
    });
  }

  /* ───────────────────────── Titres : apparition au scroll ───────────────────────── */
  splits.forEach((s, el) => {
    if (el.closest('.hero')) return;
    gsap.to(s.inners, {
      yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: el.dataset.split === 'chars' ? 0.03 : 0.07,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
  const fadeUp = sel => $$(sel).forEach(el => gsap.from(el, { y: 36, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  fadeUp('.eyebrow:not(.hero__eyebrow)');
  fadeUp('.gallery__lead, .panel__lead, .rdv__lead, .rdv__hours, .find__addr, .find__tel, .hours');
  gsap.from('.qa', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.faq__list', start: 'top 85%', once: true } });

  /* ───────────────────────── Marquee réactif au scroll ───────────────────────── */
  const rows = $$('[data-marquee]').map(row => {
    const track = $('.marquee__track', row);
    const dir = parseFloat(row.dataset.marquee);
    const tw = gsap.fromTo(track, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: 38, ease: 'none', repeat: -1 });
    if (reduce) tw.pause();
    return { row, track, tw, dir };
  });
  if (!reduce) {
    let reset;
    ScrollTrigger.create({
      trigger: '#marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: self => {
        const v = Math.abs(self.getVelocity());
        const boost = 1 + Math.min(v / 260, 7);
        rows.forEach(r => gsap.to(r.tw, { timeScale: self.direction * boost, duration: 0.25, overwrite: true }));
        gsap.to('.marquee__row', { skewX: clamp(-self.getVelocity() / 380, -9, 9), duration: 0.3, overwrite: 'auto' });
        clearTimeout(reset);
        reset = setTimeout(() => {
          rows.forEach(r => gsap.to(r.tw, { timeScale: 1, duration: 1.4, ease: 'power3.out', overwrite: true }));
          gsap.to('.marquee__row', { skewX: 0, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
        }, 120);
      }
    });
  }

  /* ───────────────────────── Le geste : section pinnée ───────────────────────── */
  const story = $('#geste');
  (function storySection() {
    const steps = $$('.step', story);
    const rail = $$('.story__rail li', story);
    const setActive = i => rail.forEach((li, k) => li.classList.toggle('is-active', k === i));
    if (reduce) {
      story.classList.add('is-static');
      gsap.set('.s-color', { scaleY: 1, transformOrigin: '50% 100%' });
      gsap.set('.s-gloss-static', { opacity: 0.6 });
      gsap.set('.sp', { opacity: 1 });
      gsap.set('.s-shine', { x: 200 });
      return;
    }
    gsap.set('.s-color', { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set('.s-shine', { x: 0 });
    gsap.set('.s-tool', { x: 70, y: 560, rotation: 30, opacity: 0, transformOrigin: '0 62' });
    gsap.set('.sp', { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
    gsap.set(steps.slice(1), { opacity: 0, y: 40 });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 0px)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '.story__pin', start: 'top top', end: () => '+=' + Math.round(innerHeight * (wide() ? 3.4 : 2.8)),
          pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: self => { const i = clamp(Math.floor(self.progress * 4.5 + 0.2), 0, 3); setActive(i); }
        }
      });
      const frame = $('.story__frame');
      tl.to(frame, { rotate: -2, duration: 4.5, ease: 'none' }, 0);

      // Étape 2 : préparation — la cuticule est repoussée, un poussoir passe
      tl.to(steps[0], { opacity: 0, y: -40, duration: 0.35 }, 0.75)
        .to(steps[1], { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 1)
        .to('.story__bignum-in', { yPercent: -25, duration: 0.4, ease: 'power3.inOut' }, 0.85)
        .to('.s-tool', { opacity: 1, x: 130, y: 500, rotation: 24, duration: 0.3 }, 0.95)
        .to('.s-tool', { x: 270, y: 506, rotation: 18, duration: 0.8, ease: 'sine.inOut' }, 1.15)
        .to('.s-cuticle', { y: 26, duration: 0.8, ease: 'sine.inOut' }, 1.15)
        .to('.s-cuticle-line', { y: 26, duration: 0.8, ease: 'sine.inOut' }, 1.15)
        .to('.s-lunula', { scaleY: 1.4, opacity: 0.8, transformOrigin: '50% 100%', duration: 0.6 }, 1.3)
        .fromTo('.s-dust circle', { opacity: 0, y: 0 }, { opacity: 0.9, y: -26, stagger: 0.07, duration: 0.5 }, 1.2)
        .to('.s-dust circle', { opacity: 0, y: -50, stagger: 0.05, duration: 0.4 }, 1.75)

      // Étape 3 : pose — la couleur monte, pinceau en main
        .to(steps[1], { opacity: 0, y: -40, duration: 0.35 }, 1.75)
        .to(steps[2], { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 2)
        .to('.story__bignum-in', { yPercent: -50, duration: 0.4, ease: 'power3.inOut' }, 1.85)
        .to('.s-tool', { x: 200, y: 520, rotation: 0, duration: 0.3 }, 1.9)
        .set('.s-tool-bristle', { opacity: 1 }, 1.95)
        .to('.s-color', { scaleY: 1, duration: 1, ease: 'power1.inOut' }, 2)
        .to('.s-tool', { y: 150, duration: 1, ease: 'power1.inOut' }, 2)
        .to('.s-tool', { x: '+=14', duration: 0.12, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 2)

      // Étape 4 : finition — brillance, éclats
        .to(steps[2], { opacity: 0, y: -40, duration: 0.35 }, 2.75)
        .to(steps[3], { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 3)
        .to('.story__bignum-in', { yPercent: -75, duration: 0.4, ease: 'power3.inOut' }, 2.85)
        .to('.s-tool', { opacity: 0, y: -80, duration: 0.4 }, 2.95)
        .to('.s-shine', { x: 640, duration: 1.1, ease: 'power2.inOut' }, 3)
        .to('.s-gloss-static', { opacity: 0.65, duration: 0.5 }, 3.3)
        .to('.sp', { opacity: 1, scale: 1, rotation: 90, stagger: 0.14, duration: 0.5, ease: 'back.out(2)' }, 3.3)
        .to('.sp', { opacity: 0.4, scale: 0.7, yoyo: true, repeat: 1, stagger: 0.1, duration: 0.3 }, 3.9)
        .to({}, { duration: 0.6 }, 3.9);
      return () => setActive(0);
    });
  })();

  /* ───────────────────────── Prestations : défilement horizontal ───────────────────────── */
  const services = $('#prestations');
  (function servicesSection() {
    const track = $('#servicesTrack');
    const pin = $('.services__pin', services);
    const cards = $$('.card', services);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      services.classList.add('is-hscroll');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      gsap.to('.services__bgword', { xPercent: -28, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), scrub: true } });
      cards.forEach(card => {
        gsap.fromTo(card, { scale: 0.9, opacity: 0.35 }, {
          scale: 1, opacity: 1, ease: 'power2.out',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 98%', end: 'left 62%', scrub: true }
        });
      });
      gsap.from('.panel--intro > *', { y: 50, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: pin, start: 'top 70%', once: true } });
      return () => services.classList.remove('is-hscroll');
    });
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      cards.forEach(card => gsap.from(card, { y: 70, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } }));
      gsap.to('.services__bgword', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: services, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  })();

  /* ───────────────────────── Chiffres animés ───────────────────────── */
  $$('.stat').forEach((stat, i) => {
    const b = $('[data-count]', stat), ring = $('.stat__ring circle', stat);
    const target = parseFloat(b.dataset.count), dec = parseInt(b.dataset.decimals || '0', 10);
    const fmt = v => v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const o = { v: reduce ? target : 0 };
    b.textContent = fmt(o.v);
    if (reduce) { gsap.set(ring, { strokeDashoffset: 0 }); return; }
    gsap.timeline({ scrollTrigger: { trigger: stat, start: 'top 82%', once: true } })
      .to(ring, { strokeDashoffset: 0, duration: 2, ease: 'power3.inOut' }, i * 0.12)
      .to(o, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: () => { b.textContent = fmt(o.v); } }, i * 0.12)
      .from(stat, { scale: 0.85, opacity: 0, duration: 1.2, ease: 'expo.out' }, i * 0.12);
  });

  /* ───────────────────────── Nuancier ───────────────────────── */
  $$('[data-tile]').forEach((tile, i) => {
    const frame = $('.tile__frame', tile), art = $('.tile__art', tile), cap = $('figcaption', tile);
    if (!reduce) {
      gsap.fromTo(frame, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(142% at 50% 100%)', duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: tile, start: 'top 90%', once: true } });
      gsap.from(art, { scale: 1.35, rotate: 6, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: tile, start: 'top 90%', once: true } });
      gsap.from(cap, { y: 24, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.25, scrollTrigger: { trigger: tile, start: 'top 90%', once: true } });
      gsap.fromTo(art, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: tile, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  });

  /* ───────────────────────── Avis : carrousel ───────────────────────── */
  (function reviews() {
    const stage = $('#revStage');
    const items = $$('.review', stage);
    const dotsWrap = $('#revDots');
    const bar = $('#revBar');
    const cur = $('#revCur'), tot = $('#revTot');
    const pauseBtn = $('#revPause');
    let idx = 0, userPaused = reduce, hovering = false, inView = false, busy = false, timer = null;
    const pad = n => String(n).padStart(2, '0');
    tot.textContent = pad(items.length);

    items.forEach((it, k) => { it.setAttribute('role', 'group'); it.setAttribute('aria-roledescription', 'avis'); it.setAttribute('aria-label', `${k + 1} sur ${items.length}`); });
    const dots = items.map((_, k) => {
      const li = document.createElement('li'); const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', `Afficher l’avis ${k + 1} sur ${items.length}`); b.innerHTML = '<i></i>';
      b.addEventListener('click', () => show(k, k > idx ? 1 : -1, true));
      li.appendChild(b); dotsWrap.appendChild(li); return b;
    });
    const setH = () => { stage.style.setProperty('--rev-h', items[idx].offsetHeight + 'px'); };
    const syncUI = () => { cur.textContent = pad(idx + 1); dots.forEach((d, k) => d.setAttribute('aria-current', k === idx ? 'true' : 'false')); };

    function duration(it) { return clamp(6 + it.textContent.length * 0.028, 7, 18); }
    function startTimer() {
      if (timer) timer.kill();
      gsap.set(bar, { scaleX: 0 });
      if (reduce) return;
      timer = gsap.to(bar, { scaleX: 1, duration: duration(items[idx]), ease: 'none', onComplete: () => show(idx + 1, 1) });
      applyPause();
    }
    function applyPause() { if (timer) timer.paused(userPaused || hovering || !inView || document.hidden); }

    function show(n, dir = 1, manual = false) {
      if (busy) return;
      const next = (n + items.length) % items.length;
      if (next === idx) return;
      busy = true;
      const from = items[idx], to = items[next];
      if (timer) timer.kill();
      idx = next; syncUI();
      const done = () => { from.classList.remove('is-active'); busy = false; setH(); startTimer(); };
      to.classList.add('is-active'); stage.style.setProperty('--rev-h', to.offsetHeight + 'px');
      if (reduce) { gsap.set(from, { opacity: 0 }); gsap.set(to, { opacity: 1 }); done(); return; }
      const tl = gsap.timeline({ onComplete: () => { gsap.set(from, { clearProps: 'all' }); done(); } });
      tl.to(from, { opacity: 0, x: -50 * dir, duration: 0.55, ease: 'power3.in' }, 0)
        .fromTo(to, { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0.3)
        .fromTo($$('blockquote p', to), { y: 44 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.14, ease: 'expo.out' }, 0.35)
        .fromTo($('figcaption', to), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.7)
        .fromTo($('.avatar', to), { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(2)' }, 0.7);
      gsap.fromTo('.reviews__bgquote', { rotate: 0 }, { rotate: 6 * dir, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
    }

    $('#revNext').addEventListener('click', () => show(idx + 1, 1, true));
    $('#revPrev').addEventListener('click', () => show(idx - 1, -1, true));
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Reprendre le défilement' : 'Mettre le défilement en pause');
      applyPause();
    });
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    if (userPaused) pauseBtn.setAttribute('aria-label', 'Reprendre le défilement');
    const sec = $('#avis');
    sec.addEventListener('pointerenter', () => { hovering = true; applyPause(); });
    sec.addEventListener('pointerleave', () => { hovering = false; applyPause(); });
    sec.addEventListener('focusin', () => { hovering = true; applyPause(); });
    sec.addEventListener('focusout', () => { hovering = false; applyPause(); });
    sec.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(idx + 1, 1, true); if (e.key === 'ArrowLeft') show(idx - 1, -1, true); });
    document.addEventListener('visibilitychange', applyPause);
    ScrollTrigger.create({ trigger: sec, start: 'top 70%', end: 'bottom 20%', onToggle: s => { inView = s.isActive; applyPause(); } });
    gsap.set(items[0], { opacity: 1 });
    addEventListener('resize', setH);
    document.fonts && document.fonts.ready.then(setH);
    gsap.to('.reviews__bgquote', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
    syncUI(); setH(); startTimer();
  })();

  /* ───────────────────────── Rendez-vous : composeur ───────────────────────── */
  const eur = v => v.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }) + ' €';
  const hm = m => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}` : `${m} min`);
  const GROUPS = [
    { id: 'pose', title: 'Pose & remplissage', single: true, items: [
      { id: 'caps-pose', label: 'Capsules américaines — pose initiale', price: 40, dur: 120 },
      { id: 'caps-remp', label: 'Capsules américaines — remplissage', note: 'Dépose et repose de nouvelles capsules obligatoires', price: 50, dur: 140 },
      { id: 'gel', label: 'Ongles naturels avec renfort gel', price: 55, dur: 100 },
      { id: 'remp3', label: 'Remplissage 3 semaines', note: 'Environ 21 à 28 jours', price: 40, dur: 100 },
      { id: 'remp4', label: 'Remplissage 4 semaines', note: 'Plus de 28 jours', price: 50, dur: 120 },
      { id: 'rallong', label: 'Rallongement demi-capsules + gel', note: 'Tarif modèle', price: 40, dur: 120 }] },
    { id: 'vernis', title: 'Vernis semi-permanent', single: true, items: [
      { id: 'sp-pose', label: 'Pose de vernis semi-permanent', price: 30, dur: 45 },
      { id: 'sp-repose', label: 'Vernis semi-permanent — dépose + repose', price: 35, dur: 60 }] },
    { id: 'depose', title: 'Dépose & soins', single: true, items: [
      { id: 'd-salon', label: 'Dépose et soins', note: 'Pose réalisée au salon', price: 20, dur: 60 },
      { id: 'd-autre', label: 'Dépose et soins', note: 'Pose réalisée par un autre prestataire', price: 25, dur: 45, other: true },
      { id: 'dm-salon', label: 'Dépose + soins + beauté complète des mains', note: 'Pose réalisée au salon', price: 30, dur: 60 },
      { id: 'dm-autre', label: 'Dépose + soins + beauté complète des mains', note: 'Pose réalisée par un autre prestataire', price: 35, dur: 60, other: true },
      { id: 'japonais', label: 'Beauté complète des mains + soin japonais', price: 35, dur: 50 }] },
    { id: 'art', title: 'Nail art', single: false, items: [
      { id: 'french', label: 'French — 10 doigts', note: 'Ne peut pas être réservé seul', price: 7, dur: 15, french: true },
      { id: 'deco-s', label: 'Décoration simple', note: 'Strass, effet nacré…', unit: 0.5, dur: 10, fingers: true },
      { id: 'deco-m', label: 'Décoration moyenne', note: 'Traits fins, dégradés, petits motifs', unit: 1, from: true, dur: 10, fingers: true },
      { id: 'deco-c', label: 'Décoration complexe', note: 'Sur devis', devis: true, dur: 10 }] },
    { id: 'repar', title: 'Réparation', single: true, items: [
      { id: 'repar', label: 'Réparation après 10 jours', note: 'Casse importante ou ongle décollé', price: 4, dur: 10 }] }
  ];

  (function composer() {
    const wrap = $('#composerGroups');
    const state = new Map(); // id -> {item, fingers}
    const all = {};
    GROUPS.forEach(g => {
      const fs = document.createElement('fieldset'); fs.className = 'cgroup';
      fs.innerHTML = `<legend>${g.title}</legend><div class="cgroup__items"></div>`;
      const box = $('.cgroup__items', fs);
      g.items.forEach(it => {
        all[it.id] = it;
        const priceTxt = it.devis ? 'devis' : it.unit ? `${it.from ? 'dès ' : ''}${eur(it.unit)}/doigt` : eur(it.price);
        const lab = document.createElement('label'); lab.className = 'copt';
        lab.innerHTML = `<input type="checkbox" name="${g.id}" value="${it.id}"><span class="copt__box" aria-hidden="true"></span><span class="copt__label">${it.label}${it.note ? `<small>${it.note}</small>` : ''}</span><span class="copt__price">${priceTxt}</span>${it.fingers ? '<span class="copt__fingers"><span>Doigts</span><button type="button" data-d="-1" aria-label="Un doigt de moins">−</button><output aria-live="polite">10</output><button type="button" data-d="1" aria-label="Un doigt de plus">+</button></span>' : ''}`;
        const input = $('input', lab);
        input.addEventListener('change', () => {
          if (input.checked) {
            if (g.single) $$(`input[name="${g.id}"]`, wrap).forEach(o => { if (o !== input) o.checked = false; });
            state.set(it.id, { it, fingers: 10 });
          } else state.delete(it.id);
          if (g.single) g.items.forEach(o => { if (o.id !== it.id) state.delete(o.id); });
          if (input.checked) { const f = $('output', lab); if (f) f.textContent = '10'; }
          render();
        });
        if (it.fingers) $$('.copt__fingers button', lab).forEach(btn => btn.addEventListener('click', e => {
          e.preventDefault(); e.stopPropagation();
          const s = state.get(it.id); if (!s) return;
          s.fingers = clamp(s.fingers + parseInt(btn.dataset.d, 10), 1, 10);
          $('output', lab).textContent = s.fingers; render();
        }));
        box.appendChild(lab);
      });
      wrap.appendChild(fs);
    });

    const list = $('#ticketList'), dur = $('#ticketDur'), total = $('#ticketTotal'), note = $('#ticketNote');
    const call = $('#btnCall'), sms = $('#btnSms'), copy = $('#btnCopy'), ticket = $('.ticket');
    let summaryText = '';

    function render() {
      const sel = [...state.values()];
      let sum = 0, min = 0, from = false, devis = false;
      const rowsHtml = sel.map(({ it, fingers }) => {
        let p = 0, txt;
        if (it.devis) { devis = true; txt = 'devis'; }
        else if (it.unit) { p = it.unit * fingers; if (it.from) from = true; txt = `${it.from ? 'dès ' : ''}${eur(p)}`; }
        else { p = it.price; txt = eur(p); }
        sum += p; min += it.dur;
        return { label: it.label + (it.unit ? ` (${fingers} doigts)` : '') + (it.note && it.other ? ' — autre prestataire' : ''), txt };
      });
      list.innerHTML = rowsHtml.length ? rowsHtml.map(r => `<li><span>${r.label}</span><span>${r.txt}</span></li>`).join('') : '<li class="ticket__empty">Choisis une ou plusieurs prestations.</li>';
      dur.textContent = sel.length ? '≈ ' + hm(min) : '—';
      total.textContent = sel.length ? `${from || devis ? 'dès ' : ''}${eur(sum)}` : '—';
      const notes = [];
      const ids = sel.map(s => s.it.id);
      if (ids.length === 1 && ids[0] === 'french') notes.push('Le French ne peut pas être réservé seul : ajoute une autre prestation.');
      if (ids.includes('caps-remp')) notes.push('Remplissage de capsules : dépose des anciennes et repose de nouvelles obligatoires.');
      if (sel.some(s => s.it.other)) notes.push('Pense à préciser le type de matériel présent sur tes ongles.');
      if (devis) notes.push('Décoration complexe : prix sur devis, à confirmer avec le salon.');
      note.textContent = notes.join(' ');
      const lines = rowsHtml.map(r => `• ${r.label} (${r.txt})`).join('\n');
      summaryText = sel.length
        ? `Bonjour, je souhaite prendre rendez-vous à L’intemporelle Brest pour :\n${lines}\nTotal estimé : ${from || devis ? 'dès ' : ''}${eur(sum)} — durée ≈ ${hm(min)}.\nMes disponibilités : `
        : 'Bonjour, je souhaite prendre rendez-vous à L’intemporelle Brest. Mes disponibilités : ';
      sms.href = `sms:${PHONE}?&body=${encodeURIComponent(summaryText)}`;
      ticket.classList.remove('pop'); void ticket.offsetWidth; ticket.classList.add('pop');
    }
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(summaryText); copy.textContent = 'Récapitulatif copié ✓'; }
      catch { copy.textContent = 'Copie impossible — sélectionne le texte du ticket'; }
      setTimeout(() => { copy.textContent = 'Copier le récapitulatif'; }, 2400);
    });
    render();
    ticket.classList.remove('pop');

    if (!reduce) {
      gsap.from('.cgroup', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.composer', start: 'top 80%', once: true } });
      gsap.from('.ticket', { y: 80, rotate: 3, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.composer', start: 'top 75%', once: true } });
    }
  })();

  // Rideau circulaire de la section rendez-vous
  if (!reduce) {
    gsap.to('.rdv__reveal', { scale: 1, ease: 'none', scrollTrigger: { trigger: '.rdv', start: 'top 85%', end: 'top 15%', scrub: true } });
    gsap.from('.rdv__title em', { x: 80, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.rdv__title', start: 'top 85%', once: true } });
    gsap.from('.rdv__phone', { scale: 0.7, opacity: 0, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.rdv__phone', start: 'top 92%', once: true } });
  } else { gsap.set('.rdv__reveal', { scale: 1 }); }

  /* ───────────────────────── Horaires & statut d’ouverture ───────────────────────── */
  (function hours() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t).value;
    const day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
    const mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
    const open = day >= 1 && day <= 6 && mins >= 540 && mins < 1260;
    $$(`#hoursList li`).forEach(li => li.classList.toggle('is-today', parseInt(li.dataset.d, 10) === day));
    const s = $('#openStatus'), span = $('span', s);
    s.classList.remove('is-open', 'is-closed');
    if (open) { s.classList.add('is-open'); span.textContent = 'Ouvert maintenant · jusqu’à 21h'; }
    else {
      s.classList.add('is-closed');
      const soon = day >= 1 && day <= 6 && mins < 540;
      span.textContent = soon ? 'Fermé · ouvre à 9h' : (day === 6 ? 'Fermé · ouvre lundi à 9h' : day === 0 ? 'Fermé · ouvre lundi à 9h' : 'Fermé · ouvre demain à 9h');
    }
  })();
  $('#year').textContent = new Date().getFullYear();

  if (!reduce) {
    gsap.from('.find__mapframe', { yPercent: 8, scale: 0.92, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.find__map', start: 'top 85%', once: true } });
    gsap.fromTo('.find__mapframe', { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.find', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.hours__list li', { x: -30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: '.hours__list', start: 'top 88%', once: true } });
    gsap.from('.find__open', { scale: 0, rotate: -12, duration: 1, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.find__map', start: 'top 60%', once: true } });
  }

  /* ───────────────────────── Footer géant ───────────────────────── */
  (function footer() {
    const g = $('#footerGiant');
    const { inners } = splitEl(g, true);
    g.querySelectorAll('.sr-only').forEach(n => n.remove());
    g.removeAttribute('data-split');
    if (reduce) return;
    gsap.set(inners, { yPercent: 105 });
    gsap.to(inners, { yPercent: 0, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: '.footer', start: 'top 70%', end: 'bottom bottom', scrub: 0.8 } });
    gsap.from('.footer__cols > div', { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.footer__cols', start: 'top 90%', once: true } });
  })();

  // le bouton « Appeler » flottant s’efface devant la section rendez-vous et le pied de page
  const fab = $('.fab'), fabAway = new Set();
  ['#rdv', '#footer'].forEach(sel => ScrollTrigger.create({
    trigger: sel, start: 'top 80%', end: 'bottom top',
    onToggle: self => { self.isActive ? fabAway.add(sel) : fabAway.delete(sel); fab.classList.toggle('is-away', fabAway.size > 0); }
  }));

  /* ───────────────────────── Micro-interactions (souris) ───────────────────────── */
  if (fine && !reduce) {
    // curseur
    const cursor = $('#cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });
    addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); cursor.classList.remove('is-hidden'); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('pointerover', e => { cursor.classList.toggle('is-hover', !!e.target.closest('a,button,summary,label.copt,[data-tilt],.tile__frame')); });

    // boutons magnétiques
    $$('.magnetic').forEach(el => {
      const qx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,.55)' }), qy = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,.55)' });
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); qx((e.clientX - (r.left + r.width / 2)) * 0.32); qy((e.clientY - (r.top + r.height / 2)) * 0.4); });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });

    // inclinaison 3D + reflet qui suit la souris
    const tiltTargets = [...$$('[data-tilt]'), ...$$('.tile__frame')];
    tiltTargets.forEach(el => {
      const rxT = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' }), ryT = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        ryT((x - 0.5) * 14); rxT(-(y - 0.5) * 14);
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { ryT(0); rxT(0); });
    });
  }

  /* ───────────────────────── Démarrage ───────────────────────── */
  runLoader();
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts) document.fonts.ready.then(refresh);
  addEventListener('load', () => setTimeout(refresh, 300));
  addEventListener('orientationchange', () => setTimeout(refresh, 400));
})();
