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
     5. INTRO SEQUENCE (7-SECOND CINEMATIC FULLSCREEN INTRO)
     ──────────────────────────────────────────────────────────── */
  function initIntro() {
    const overlay      = document.getElementById('introOverlay');
    const glow         = document.querySelector('.intro-glow');
    const photoMask    = document.getElementById('introPhotoMask');
    const photo        = document.getElementById('introPhoto');
    const badge        = document.getElementById('introBadge');
    const nameEl       = document.getElementById('introName');
    const roleEl       = document.getElementById('introRole');
    const statusEl     = document.getElementById('introStatus');
    const progressFill = document.getElementById('introProgressFill');
    const counter      = document.getElementById('introCounter');
    const skipBtn      = document.getElementById('introSkipBtn');
    const heroPortrait = document.getElementById('heroPortrait');

    if (!overlay) { heroEntrance(false); return; }

    // Respect reduced motion
    if (reducedMotion) {
      overlay.remove();
      heroEntrance(false);
      return;
    }

    // Sync intro text from actual page content if available
    const brandName = document.querySelector('.brand-name');
    const brandRole = document.querySelector('.brand-role');
    if (brandName && nameEl) nameEl.textContent = brandName.textContent.trim();
    if (brandRole && roleEl) roleEl.textContent = brandRole.textContent.trim();

    document.body.style.overflow = 'hidden';

    // Preload photo before starting the 7s timeline
    const preload = new Promise((res) => {
      const img = new Image();
      img.src = photo ? photo.src : 'assets/images/prateek.jpg';
      if (img.complete && img.naturalWidth) res();
      else { img.onload = res; img.onerror = res; setTimeout(res, 2000); }
    });

    preload.then(() => {
      // Initial states
      gsap.set(photoMask, { clipPath: 'inset(100% 0% 0% 0% round 24px)', opacity: 0, scale: 0.96 });
      gsap.set(photo,     { scale: 1.35 });
      if (badge) gsap.set(badge, { opacity: 0, y: 15 });
      gsap.set(nameEl,    { yPercent: 110 });
      gsap.set(roleEl,    { opacity: 0, y: 20 });
      if (statusEl) gsap.set(statusEl, { opacity: 0, y: 10 });
      if (glow) gsap.set(glow, { scale: 0.8, opacity: 0 });

      const tl = gsap.timeline({ onComplete: finish });

      // 1. Ambient glow & Photo Reveal (0.0s - 1.8s)
      if (glow) {
        tl.to(glow, { opacity: 0.85, scale: 1.15, duration: 3.0, ease: 'power2.out' }, 0.2);
      }

      tl.to(photoMask, {
        clipPath: 'inset(0% 0% 0% 0% round 24px)',
        opacity: 1,
        scale: 1,
        duration: 1.8,
        ease: 'power3.out',
      }, 0.2);

      // Photo continuous cinematic scale/drift (0.2s - 6.0s = 5.8s)
      tl.to(photo, {
        scale: 1.05,
        duration: 5.8,
        ease: 'power1.out',
      }, 0.2);

      // 2. Badge & Name slide-up (0.8s - 2.2s)
      if (badge) {
        tl.to(badge, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        }, 0.8);
      }

      tl.to(nameEl, {
        yPercent: 0,
        duration: 1.2,
        ease: 'power3.out',
      }, 1.0);

      // Role fade-in (1.4s - 2.4s)
      tl.to(roleEl, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
      }, 1.4);

      // Dynamic status sequence across the 7 seconds
      if (statusEl) {
        tl.to(statusEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.8);
        tl.to(statusEl, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => { if (statusEl) statusEl.textContent = 'Curating AI projects & research...'; }
        }, 3.3);
        tl.to(statusEl, { opacity: 1, duration: 0.4 }, 3.7);
        tl.to(statusEl, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => { if (statusEl) statusEl.textContent = 'System initialized. Welcome.'; }
        }, 5.1);
        tl.to(statusEl, { opacity: 1, duration: 0.4 }, 5.5);
      }

      // 3. Counter 000% → 100% & Progress fill across 5.8 seconds (0.2s - 6.0s)
      const cObj = { v: 0 };
      tl.to(cObj, {
        v: 100,
        duration: 5.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          const val = Math.floor(cObj.v);
          if (counter) counter.textContent = `${String(val).padStart(3, '0')}%`;
          if (progressFill) progressFill.style.width = `${val}%`;
        },
      }, 0.2);

      // 4. Brief hold at 100% (6.0s - 6.3s)
      tl.to({}, { duration: 0.3 }, 6.0);

      // 5. Flip morph photo into hero + wipe overlay (6.3s - 7.0s)
      tl.add(() => {
        if (typeof Flip !== 'undefined' && heroPortrait && photo) {
          const state = Flip.getState(photo);
          heroPortrait.parentElement.appendChild(photo);
          Flip.from(state, {
            duration: 0.7,
            ease: 'power3.inOut',
            onComplete: () => { if (photo.parentElement !== photoMask) photo.remove(); },
          });
        }
      }, 6.3);

      // Smooth slide-up transition of fullscreen overlay
      tl.to(overlay, {
        yPercent: -100,
        opacity: 0.95,
        duration: 0.7,
        ease: 'power3.inOut',
      }, 6.3);

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
          start: 'top 96%',
          once: true,
        },
      });

      if (idx) {
        tl.from(idx, { opacity: 0, x: -20, duration: 0.4, ease: C.ease.smooth, clearProps: 'all' });
      }
      if (h2) {
        tl.from(h2, { opacity: 0, y: 30, duration: C.dur.heading, ease: C.ease.smooth, clearProps: 'all' }, idx ? '-=0.3' : 0);
      }
    });

    // ── C. General content blocks (about text, summary card, etc.) ──
    document.querySelectorAll('.about-text-col, .about-summary-card, .about-chips').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 96%', once: true },
        opacity: 0, y: 25, duration: 0.6, ease: C.ease.smooth, clearProps: 'all',
      });
    });

    // ── D. Project cards — staggered lift with 3D tilt on desktop ──
    document.querySelectorAll('.project-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 96%', once: true },
        opacity: 0,
        y: 35,
        duration: C.dur.card,
        delay: i * 0.04,
        ease: C.ease.smooth,
        clearProps: 'opacity,transform',
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
        scrollTrigger: { trigger: eduCard, start: 'top 96%', once: true },
        opacity: 0, y: 25, duration: 0.6, ease: C.ease.smooth, clearProps: 'all',
      });

      document.querySelectorAll('.sgpa-bar').forEach((bar) => {
        const tw = bar.getAttribute('data-width') || '80';
        gsap.fromTo(bar, { width: '0%' }, {
          scrollTrigger: { trigger: bar, start: 'top 96%', once: true },
          width: `${tw}%`, duration: C.dur.meter, ease: C.ease.smooth,
        });
      });
    }

    // ── F. Skills toolkit ──
    const skillCards = document.querySelectorAll('.skills-bento .skill-card');
    if (skillCards.length) {
      gsap.from(skillCards, {
        scrollTrigger: { trigger: '.skills-bento', start: 'top 96%', once: true },
        opacity: 0, y: 30, duration: 0.6,
        stagger: C.stagger.skills, ease: C.ease.smooth, clearProps: 'all',
      });

      document.querySelectorAll('.meter-bar i').forEach((bar) => {
        const tw = bar.getAttribute('data-width') || '85%';
        gsap.fromTo(bar, { width: '0%' }, {
          scrollTrigger: { trigger: bar, start: 'top 96%', once: true },
          width: tw, duration: C.dur.meter, ease: C.ease.smooth,
        });
      });
    }

    // ── G. Experience timeline ──
    document.querySelectorAll('.timeline-card, .experience-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 96%', once: true },
        opacity: 0, y: 30, duration: 0.6,
        delay: i * 0.05,
        ease: C.ease.smooth, clearProps: 'all',
      });
    });

    // ── H. Milestones & certificates ──
    const milestones = document.querySelectorAll('.milestone-card, .achieve-card');
    if (milestones.length) {
      gsap.from(milestones, {
        scrollTrigger: { trigger: '.milestones-grid, .achievements-grid', start: 'top 96%', once: true },
        opacity: 0, y: 25, duration: 0.6,
        stagger: C.stagger.milestones, ease: C.ease.smooth, clearProps: 'all',
      });
    }

    const certs = document.querySelector('.certifications-strip');
    if (certs) {
      gsap.from(certs, {
        scrollTrigger: { trigger: certs, start: 'top 96%', once: true },
        opacity: 0, y: 25, duration: 0.6, ease: C.ease.smooth, clearProps: 'all',
      });
    }

    // ── I. Stat counters ──
    document.querySelectorAll('.val[data-count]').forEach((el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { n: 0 };

      ScrollTrigger.create({
        trigger: el, start: 'top 96%', once: true,
        onEnter: () => {
          gsap.to(obj, {
            n: target, duration: 1.2, ease: 'power2.out',
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
        scrollTrigger: { trigger: '#contact', start: 'top 98%', once: true },
        opacity: 0, y: 25, duration: 0.6,
        stagger: 0.08, ease: C.ease.smooth, clearProps: 'all',
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
        scrollTrigger: { trigger: '.about-chips', start: 'top 96%', once: true },
        opacity: 0, y: 15, scale: 0.95,
        duration: 0.4, stagger: 0.05, ease: C.ease.smooth, clearProps: 'all',
      });
    }

    // ── N. Footer ──
    const footer = document.querySelector('.site-footer, footer');
    if (footer) {
      gsap.from(footer, {
        scrollTrigger: { trigger: footer, start: 'top 98%', once: true },
        opacity: 0, y: 20, duration: 0.5, ease: C.ease.smooth, clearProps: 'all',
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
