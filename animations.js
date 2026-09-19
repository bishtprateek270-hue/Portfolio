/* ==========================================================================
   PRATEEK SINGH BISHT — POLISHED ANIMATION ENGINE v2
   GSAP 3 + ScrollTrigger + Flip + Lenis
   ========================================================================== */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. TUNABLE CONFIG — adjust motion feel from one place
     ──────────────────────────────────────────────────────────── */
  const C = {
    dur: {
      introWipe:    1.0,
      introText:    0.75,
      introCounter: 1.6,
      introFlip:    0.9,
      heroStagger:  0.7,
      heading:      0.8,
      card:         0.75,
      meter:        1.3,
      magnetic:     0.3,
    },
    ease: {
      smooth:  'power4.out',
      editorial: 'cubic-bezier(0.22,1,0.36,1)',
      expo:    'expo.out',
      inOut:   'power3.inOut',
    },
    stagger: {
      hero:       0.11,
      projects:   0.15,
      skills:     0.09,
      milestones: 0.1,
    },
    cursor: {
      dotLerp:  0.92,   // lower = more lag, 1 = instant
      ringLerp: 0.12,   // smooth trailing ring
    },
  };

  /* ────────────────────────────────────────────────────────────
     2. ENVIRONMENT
     ──────────────────────────────────────────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop     = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (typeof gsap === 'undefined') {
    console.warn('[Anim] GSAP missing — skipping animations.');
    return;
  }
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  if (typeof Flip !== 'undefined')          gsap.registerPlugin(Flip);

  /* ────────────────────────────────────────────────────────────
     3. SMOOTH SCROLL (NATIVE)
        Native scrolling used for 1:1 instant response with zero delay/lag.
     ──────────────────────────────────────────────────────────── */
  function initLenis() {
    // Disabled smooth scroll hijacking to ensure instant, lag-free native scroll
  }

  /* ────────────────────────────────────────────────────────────
     4. CUSTOM CURSOR (DESKTOP ONLY) — zero-lag dot
        The dot tracks raw mouse coords every single frame via
        gsap.ticker so it never falls behind during scroll.
     ──────────────────────────────────────────────────────────── */
  function initCursor() {
    // Custom cursor removed
  }


  /* ────────────────────────────────────────────────────────────
     5. INTRO SEQUENCE
     ──────────────────────────────────────────────────────────── */
  function initIntro() {
    const overlay     = document.getElementById('introOverlay');
    const photoMask   = document.getElementById('introPhotoMask');
    const photo       = document.getElementById('introPhoto');
    const nameEl      = document.getElementById('introName');
    const roleEl      = document.getElementById('introRole');
    const counter     = document.getElementById('introCounter');
    const skipBtn     = document.getElementById('introSkipBtn');
    const heroPortrait = document.getElementById('heroPortrait');

    if (!overlay) { heroEntrance(false); return; }

    // Skip if already seen or user prefers reduced motion
    if (sessionStorage.getItem('psb_intro_seen') || reducedMotion) {
      overlay.remove();
      heroEntrance(false);
      return;
    }

    // Sync intro text from the actual page content
    const brandName = document.querySelector('.brand-name');
    const brandRole = document.querySelector('.brand-role');
    if (brandName && nameEl) nameEl.textContent = brandName.textContent.trim();
    if (brandRole && roleEl) roleEl.textContent = brandRole.textContent.trim();

    document.body.style.overflow = 'hidden';

    // Preload photo
    const preload = new Promise((res) => {
      const img = new Image();
      img.src = photo ? photo.src : 'assets/images/prateek.jpg';
      if (img.complete && img.naturalWidth) res();
      else { img.onload = res; img.onerror = res; setTimeout(res, 2500); }
    });

    preload.then(() => {
      // Initial states
      gsap.set(photoMask, { clipPath: 'inset(100% 0% 0% 0% round 20px)' });
      gsap.set(photo,     { scale: 1.3 });
      gsap.set(nameEl,    { yPercent: 110 });
      gsap.set(roleEl,    { opacity: 0, y: 20 });

      const tl = gsap.timeline({ onComplete: finish });

      // Photo wipe-in
      tl.to(photoMask, {
        clipPath: 'inset(0% 0% 0% 0% round 20px)',
        duration: C.dur.introWipe,
        ease: C.ease.smooth,
      }, 0.15);

      tl.to(photo, {
        scale: 1,
        duration: C.dur.introWipe + 0.4,
        ease: C.ease.smooth,
      }, 0.15);

      // Name slide-up (masked)
      tl.to(nameEl, {
        yPercent: 0,
        duration: C.dur.introText,
        ease: C.ease.smooth,
      }, 0.5);

      // Role fade-in
      tl.to(roleEl, {
        opacity: 1, y: 0,
        duration: C.dur.introText * 0.75,
        ease: C.ease.smooth,
      }, 0.7);

      // Counter 0→100%
      const cObj = { v: 0 };
      tl.to(cObj, {
        v: 100,
        duration: C.dur.introCounter,
        ease: 'power2.out',
        onUpdate: () => {
          if (counter) counter.textContent = `${String(Math.floor(cObj.v)).padStart(3, '0')}%`;
        },
      }, 0.15);

      // Short hold
      tl.to({}, { duration: 0.3 });

      // Flip morph photo into hero
      tl.add(() => {
        if (typeof Flip !== 'undefined' && heroPortrait && photo) {
          const state = Flip.getState(photo);
          heroPortrait.parentElement.appendChild(photo);
          Flip.from(state, {
            duration: C.dur.introFlip,
            ease: C.ease.smooth,
            onComplete: () => { if (photo.parentElement !== photoMask) photo.remove(); },
          });
        }
      });

      // Wipe overlay up
      tl.to(overlay, {
        yPercent: -100,
        duration: 0.8,
        ease: C.ease.smooth,
      }, '-=0.65');

      // Skip button
      if (skipBtn) skipBtn.addEventListener('click', () => { tl.kill(); finish(); });

      function finish() {
        sessionStorage.setItem('psb_intro_seen', 'true');
        document.body.style.overflow = '';
        if (overlay) overlay.remove();
        heroEntrance(true);
      }
    });
  }

  /* ────────────────────────────────────────────────────────────
     6. HERO ENTRANCE
     ──────────────────────────────────────────────────────────── */
  function heroEntrance(animate) {
    const els = [
      '.eyebrow-chip',
      '.hero-headline',
      '.hero-subheadline',
      '.bento-bio-card',
      '.bento-portrait-card',
      '.metrics-strip',
    ];

    if (!animate || reducedMotion) {
      gsap.set(els, { opacity: 1, y: 0, clearProps: 'all' });
      return;
    }

    gsap.fromTo(els,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: C.dur.heroStagger,
        stagger: C.stagger.hero,
        ease: C.ease.smooth,
        clearProps: 'transform',
      }
    );
  }

  /* ────────────────────────────────────────────────────────────
     7. SCROLL-DRIVEN ANIMATIONS
     ──────────────────────────────────────────────────────────── */
  function initScrollAnimations() {
    if (reducedMotion) return;

    // ── A. Smart navbar: hide on scroll down, show on scroll up ──
    const nav = document.querySelector('.nav');
    if (nav) {
      let lastDir = 0;
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          if (self.direction !== lastDir) {
            lastDir = self.direction;
            if (self.direction === 1 && self.scroll() > 120) {
              gsap.to(nav, { yPercent: -100, duration: 0.35, ease: C.ease.smooth });
            } else {
              gsap.to(nav, { yPercent: 0, duration: 0.35, ease: C.ease.smooth });
            }
          }
        },
      });
    }

    // ── B. Section headings reveal ──
    document.querySelectorAll('.sec-head').forEach((head) => {
      const idx = head.querySelector('.sec-index');
      const h2  = head.querySelector('h2');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: head,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      if (idx) {
        tl.from(idx, { opacity: 0, x: -20, duration: 0.5, ease: C.ease.smooth });
      }
      if (h2) {
        tl.from(h2, { opacity: 0, y: 40, duration: C.dur.heading, ease: C.ease.smooth }, idx ? '-=0.35' : 0);
      }
    });

    // ── C. General content blocks (about text, summary card, etc.) ──
    document.querySelectorAll('.about-text-col, .about-summary-card, .about-chips').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, y: 35, duration: 0.8, ease: C.ease.smooth,
      });
    });

    // ── D. Project cards — staggered lift with 3D tilt on desktop ──
    document.querySelectorAll('.project-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 50,
        scale: 0.97,
        duration: C.dur.card,
        delay: i * 0.05,
        ease: C.ease.smooth,
      });

      // Desktop 3D tilt
      if (isDesktop) {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -2.5;
          const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 2.5;
          gsap.to(card, {
            rotationX: rx, rotationY: ry,
            transformPerspective: 1000,
            duration: 0.35, ease: 'power2.out',
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.5, ease: C.ease.smooth });
        });
      }
    });

    // ── E. Education card + SGPA bars ──
    const eduCard = document.querySelector('.education-card, .edu-card');
    if (eduCard) {
      gsap.from(eduCard, {
        scrollTrigger: { trigger: eduCard, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, y: 35, duration: 0.8, ease: C.ease.smooth,
      });

      document.querySelectorAll('.sgpa-bar').forEach((bar) => {
        const tw = bar.getAttribute('data-width') || '80';
        gsap.fromTo(bar, { width: '0%' }, {
          scrollTrigger: { trigger: bar, start: 'top 90%', toggleActions: 'play none none none' },
          width: `${tw}%`, duration: C.dur.meter, ease: C.ease.smooth,
        });
      });
    }

    // ── F. Skills toolkit ──
    const skillCards = document.querySelectorAll('.skills-bento .skill-card');
    if (skillCards.length) {
      gsap.from(skillCards, {
        scrollTrigger: { trigger: '.skills-bento', start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, y: 40, duration: 0.7,
        stagger: C.stagger.skills, ease: C.ease.smooth,
      });

      document.querySelectorAll('.meter-bar i').forEach((bar) => {
        const tw = bar.getAttribute('data-width') || '85%';
        gsap.fromTo(bar, { width: '0%' }, {
          scrollTrigger: { trigger: bar, start: 'top 92%', toggleActions: 'play none none none' },
          width: tw, duration: C.dur.meter, ease: C.ease.smooth,
        });
      });
    }

    // ── G. Experience timeline ──
    document.querySelectorAll('.timeline-card, .experience-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, y: 40, duration: 0.8,
        delay: i * 0.08,
        ease: C.ease.smooth,
      });
    });

    // ── H. Milestones & certificates ──
    const milestones = document.querySelectorAll('.milestone-card, .achieve-card');
    if (milestones.length) {
      gsap.from(milestones, {
        scrollTrigger: { trigger: '.milestones-grid, .achievements-grid', start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, y: 35, duration: 0.7,
        stagger: C.stagger.milestones, ease: C.ease.smooth,
      });
    }

    const certs = document.querySelector('.certifications-strip');
    if (certs) {
      gsap.from(certs, {
        scrollTrigger: { trigger: certs, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0, y: 30, duration: 0.7, ease: C.ease.smooth,
      });
    }

    // ── I. Stat counters ──
    document.querySelectorAll('.val[data-count]').forEach((el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { n: 0 };

      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => {
          gsap.to(obj, {
            n: target, duration: 1.3, ease: 'power2.out',
            onUpdate: () => {
              const v = Math.floor(obj.n);
              el.textContent = v === target ? `${v}${suffix}` : `${v}`;
            },
          });
        },
      });
    });

    // ── J. Contact section ──
    const contactPanels = document.querySelectorAll('.contact-info-panel, .contact-form-panel');
    if (contactPanels.length) {
      gsap.from(contactPanels, {
        scrollTrigger: { trigger: '#contact', start: 'top 95%', toggleActions: 'play none none none' },
        opacity: 0, y: 30, duration: 0.7,
        stagger: 0.1, ease: C.ease.smooth,
      });
    }

    // ── K. Magnetic buttons (desktop) ──
    if (isDesktop) {
      document.querySelectorAll('.submit-btn, .nav-cta, .btn.primary').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) * 0.22;
          const y = (e.clientY - r.top - r.height / 2) * 0.22;
          gsap.to(btn, { x, y, duration: C.dur.magnetic, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: C.dur.magnetic + 0.12, ease: C.ease.smooth });
        });
      });
    }

    // ── L. Portrait parallax on scroll ──
    const portrait = document.querySelector('.portrait-img');
    if (portrait) {
      gsap.to(portrait, {
        scrollTrigger: {
          trigger: '.bento-portrait-card',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
        yPercent: -8,
        ease: 'none',
      });
    }

    // ── M. Chip items stagger ──
    const chips = document.querySelectorAll('.chip-item');
    if (chips.length) {
      gsap.from(chips, {
        scrollTrigger: { trigger: '.about-chips', start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0, y: 15, scale: 0.92,
        duration: 0.5, stagger: 0.07, ease: C.ease.smooth,
      });
    }

    // ── N. Footer ──
    const footer = document.querySelector('.site-footer, footer');
    if (footer) {
      gsap.from(footer, {
        scrollTrigger: { trigger: footer, start: 'top 95%', toggleActions: 'play none none none' },
        opacity: 0, y: 20, duration: 0.6, ease: C.ease.smooth,
      });
    }
  }

  /* ────────────────────────────────────────────────────────────
     8. INIT
     ──────────────────────────────────────────────────────────── */
  function boot() {
    initLenis();
    initCursor();
    initIntro();
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
