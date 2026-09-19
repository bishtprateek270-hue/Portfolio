/* ==========================================================================
   PRATEEK SINGH BISHT — POLISHED ANIMATION ENGINE
   Powered by GSAP 3, ScrollTrigger, Flip & Lenis
   Isolated Architecture with Tunable Configuration
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // 1. TUNABLE CONFIGURATION VALUES (Easily adjust motion timing & feels here)
  // ==========================================================================
  const CONFIG = {
    // Master Motion Timing
    duration: {
      introPhotoWipe: 1.1,     // Duration of intro photo clip-path wipe (seconds)
      introTextReveal: 0.8,    // Duration of name & role slide-up (seconds)
      introCounter: 1.8,       // Duration of 0-100% counter (seconds)
      introMorphFlip: 0.95,    // Duration of photo morphing to hero image (seconds)
      heroStagger: 0.75,       // Duration of hero items entrance (seconds)
      headingReveal: 0.85,     // Duration of section headings mask reveal (seconds)
      cardEntrance: 0.8,       // Duration of card scroll-in (seconds)
      meterFill: 1.4,          // Duration of SGPA/skill bar expansion (seconds)
      magneticSpeed: 0.35,     // Speed of button magnetic pull effect (seconds)
      cursorLerp: 0.15         // Smoothing factor for custom cursor lag (0.05 to 0.3)
    },

    // Curated Easing Curves
    ease: {
      primary: "power4.out",                     // Default smooth deceleration
      editorial: "cubic-bezier(0.22, 1, 0.36, 1)", // Signature high-end cubic bezier
      expo: "expo.out",                          // High-impact snappy entrance
      smoothInOut: "power3.inOut"                // Layer transitions
    },

    // Staggers
    stagger: {
      hero: 0.12,              // Stagger between hero elements
      projects: 0.18,          // Stagger between project cards
      skills: 0.1,             // Stagger between skill items
      milestones: 0.12         // Stagger between milestone cards
    },

    // Parallax Multipliers (5% to 15%)
    parallax: {
      cards: 0.08,             // 8% subtle parallax on cards
      images: 0.12             // 12% parallax on portrait/project thumbnails
    }
  };

  // ==========================================================================
  // 2. ENVIRONMENT & PREFERENCE CHECKS
  // ==========================================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Verify GSAP Availability
  if (typeof gsap === 'undefined') {
    console.warn('[Animations] GSAP library not detected. Running fallback.');
    return;
  }

  // Register GSAP Plugins
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  if (typeof Flip !== 'undefined') gsap.registerPlugin(Flip);

  // ==========================================================================
  // 3. SMOOTH INERTIA SCROLLING (LENIS)
  // ==========================================================================
  let lenisInstance = null;

  function initSmoothScroll() {
    if (prefersReducedMotion || typeof Lenis === 'undefined') return;

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5,
      infinite: false
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // ==========================================================================
  // 4. CUSTOM DESKTOP CURSOR (DOT + SMOOTH EXPANDING RING)
  // ==========================================================================
  function initCustomCursor() {
    if (!isDesktop || prefersReducedMotion) return;

    const dot = document.getElementById('customCursorDot');
    const ring = document.getElementById('customCursorRing');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    });

    // Smooth lerp loop for the lagging ring
    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * CONFIG.duration.cursorLerp;
      ringY += (mouseY - ringY) * CONFIG.duration.cursorLerp;
      gsap.set(ring, { x: ringX, y: ringY });
    });

    // Expand cursor on interactive targets
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .btn, .link-btn, .c-link, input, textarea, .stat-badge-bento, .chip-item');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ==========================================================================
  // 5. INTRO ANIMATION (PHOTO WIPE, MASKED TEXT, COUNTER & FLIP MORPH)
  // ==========================================================================
  function initIntroAnimation() {
    const introOverlay = document.getElementById('introOverlay');
    const introPhotoMask = document.getElementById('introPhotoMask');
    const introPhoto = document.getElementById('introPhoto');
    const introName = document.getElementById('introName');
    const introRole = document.getElementById('introRole');
    const introCounter = document.getElementById('introCounter');
    const introSkipBtn = document.getElementById('introSkipBtn');
    const heroPortrait = document.getElementById('heroPortrait');

    if (!introOverlay) return;

    // Check if user already saw intro in current session or prefers reduced motion
    const hasSeenIntro = sessionStorage.getItem('psb_intro_seen');
    if (hasSeenIntro || prefersReducedMotion) {
      introOverlay.remove();
      runHeroEntrance(false);
      return;
    }

    // Read Name & Role directly from existing DOM to guarantee 100% content fidelity
    const domBrandName = document.querySelector('.brand-name');
    const domBrandRole = document.querySelector('.brand-role');
    if (domBrandName && introName) introName.textContent = domBrandName.textContent.trim();
    if (domBrandRole && introRole) introRole.textContent = domBrandRole.textContent.trim();

    // Lock page scrolling during intro
    document.body.style.overflow = 'hidden';

    // Preload photo with fallback timeout
    const preloadPromise = new Promise((resolve) => {
      const img = new Image();
      img.src = introPhoto ? introPhoto.src : 'assets/images/prateek.jpg';
      if (img.complete && img.naturalWidth !== 0) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 2500); // 2.5s fallback
      }
    });

    preloadPromise.then(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          finishIntro();
        }
      });

      // 1. Initial State Setup
      gsap.set(introPhotoMask, { clipPath: 'inset(100% 0% 0% 0% round 20px)' });
      gsap.set(introPhoto, { scale: 1.25 });
      gsap.set(introName, { yPercent: 105 });
      gsap.set(introRole, { opacity: 0, y: 15 });

      // 2. Photo Clip-path Wipe & Scale
      introTl.to(introPhotoMask, {
        clipPath: 'inset(0% 0% 0% 0% round 20px)',
        duration: CONFIG.duration.introPhotoWipe,
        ease: CONFIG.ease.editorial
      }, 0.2);

      introTl.to(introPhoto, {
        scale: 1,
        duration: CONFIG.duration.introPhotoWipe + 0.3,
        ease: CONFIG.ease.editorial
      }, 0.2);

      // 3. Name & Role Masked Reveal
      introTl.to(introName, {
        yPercent: 0,
        duration: CONFIG.duration.introTextReveal,
        ease: CONFIG.ease.editorial
      }, 0.6);

      introTl.to(introRole, {
        opacity: 1,
        y: 0,
        duration: CONFIG.duration.introTextReveal * 0.8,
        ease: CONFIG.ease.primary
      }, 0.8);

      // 4. Counter Progress (0% to 100%)
      const counterObj = { val: 0 };
      introTl.to(counterObj, {
        val: 100,
        duration: CONFIG.duration.introCounter,
        ease: "power2.out",
        onUpdate: () => {
          if (introCounter) {
            introCounter.textContent = `${Math.floor(counterObj.val).toString().padStart(3, '0')}%`;
          }
        }
      }, 0.2);

      // Hold briefly before morph
      introTl.to({}, { duration: 0.35 });

      // 5. Flip Morph Transition to Hero
      introTl.add(() => {
        if (typeof Flip !== 'undefined' && heroPortrait && introPhoto) {
          // Record state for Flip transition
          const state = Flip.getState(introPhoto);
          heroPortrait.parentElement.appendChild(introPhoto);

          Flip.from(state, {
            duration: CONFIG.duration.introMorphFlip,
            ease: CONFIG.ease.editorial,
            onComplete: () => {
              // Return image structure
              if (introPhoto.parentElement !== introPhotoMask) {
                introPhoto.remove();
              }
            }
          });
        }
      });

      // 6. Wipe up intro overlay
      introTl.to(introOverlay, {
        yPercent: -100,
        duration: 0.85,
        ease: CONFIG.ease.editorial
      }, "-=0.7");

      // Skip Button Handler
      function skipIntro() {
        introTl.kill();
        finishIntro();
      }

      if (introSkipBtn) introSkipBtn.addEventListener('click', skipIntro);

      function finishIntro() {
        sessionStorage.setItem('psb_intro_seen', 'true');
        document.body.style.overflow = '';
        if (introOverlay) introOverlay.remove();
        runHeroEntrance(true);
      }
    });
  }

  // ==========================================================================
  // 6. HERO STAGGERED ENTRANCE ANIMATION
  // ==========================================================================
  function runHeroEntrance(animate) {
    const heroElements = [
      '.eyebrow-chip',
      '.hero-headline',
      '.hero-subheadline',
      '.bento-bio-card',
      '.bento-portrait-card',
      '.metrics-strip'
    ];

    if (!animate || prefersReducedMotion) {
      gsap.set(heroElements, { opacity: 1, y: 0, clearProps: "all" });
      return;
    }

    gsap.fromTo(heroElements,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: CONFIG.duration.heroStagger,
        stagger: CONFIG.stagger.hero,
        ease: CONFIG.ease.editorial,
        clearProps: "transform"
      }
    );
  }

  // ==========================================================================
  // 7. SITE-WIDE SCROLL ANIMATIONS (SCROLLTRIGGER)
  // ==========================================================================
  function initScrollAnimations() {
    if (prefersReducedMotion) return;

    // ─── A. SMART NAVBAR (HIDE ON SCROLL DOWN / SHOW ON SCROLL UP) ───
    const nav = document.querySelector('.nav');
    if (nav) {
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          if (self.direction === 1 && self.scroll() > 120) {
            nav.classList.add('nav-hidden');
          } else if (self.direction === -1) {
            nav.classList.remove('nav-hidden');
          }
        }
      });
    }

    // ─── B. SECTION HEADINGS MASK SLIDE-UP ───
    document.querySelectorAll('.sec-head').forEach((secHead) => {
      const indexTag = secHead.querySelector('.sec-index');
      const heading = secHead.querySelector('h2');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: secHead,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      if (indexTag) {
        tl.from(indexTag, {
          opacity: 0,
          y: 15,
          duration: 0.6,
          ease: CONFIG.ease.primary
        });
      }

      if (heading) {
        tl.from(heading, {
          opacity: 0,
          y: 35,
          duration: CONFIG.duration.headingReveal,
          ease: CONFIG.ease.editorial
        }, "-=0.4");
      }
    });

    // ─── C. PROJECTS SECTION (STAGGERED 3D LIFT & PARALLAX) ───
    document.querySelectorAll('.project-card').forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        scale: 0.98,
        duration: CONFIG.duration.cardEntrance,
        ease: CONFIG.ease.editorial
      });

      // Desktop Subtle 3D Tilt on Mouse Move
      if (isDesktop) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -3;
          const rotateY = ((x - centerX) / centerX) * 3;

          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            duration: 0.4,
            ease: "power2.out"
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.6,
            ease: CONFIG.ease.editorial
          });
        });
      }
    });

    // ─── D. ACADEMICS & SGPA METERS ───
    const eduCard = document.querySelector('.education-card, .edu-card');
    if (eduCard) {
      gsap.from(eduCard, {
        scrollTrigger: {
          trigger: eduCard,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: CONFIG.ease.editorial
      });

      // Animate SGPA Bars with GSAP
      document.querySelectorAll('.sgpa-bar').forEach((bar) => {
        const targetWidth = bar.getAttribute('data-width') || '80';
        gsap.fromTo(bar,
          { width: '0%' },
          {
            scrollTrigger: {
              trigger: bar,
              start: 'top 90%',
              toggleActions: 'play none none none'
            },
            width: `${targetWidth}%`,
            duration: CONFIG.duration.meterFill,
            ease: CONFIG.ease.editorial
          }
        );
      });
    }

    // ─── E. SKILLS TOOLKIT BENTO ───
    const skillCards = document.querySelectorAll('.skills-bento .skill-card');
    if (skillCards.length) {
      gsap.from(skillCards, {
        scrollTrigger: {
          trigger: '.skills-bento',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.75,
        stagger: CONFIG.stagger.skills,
        ease: CONFIG.ease.editorial
      });

      // Skill meter bars expansion
      document.querySelectorAll('.meter-bar i').forEach((bar) => {
        const targetWidth = bar.getAttribute('data-width') || '85%';
        gsap.fromTo(bar,
          { width: '0%' },
          {
            scrollTrigger: {
              trigger: bar,
              start: 'top 92%',
              toggleActions: 'play none none none'
            },
            width: targetWidth,
            duration: CONFIG.duration.meterFill,
            ease: CONFIG.ease.editorial
          }
        );
      });
    }

    // ─── F. EXPERIENCE TIMELINE ───
    document.querySelectorAll('.timeline-card, .experience-card').forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: CONFIG.ease.editorial
      });
    });

    // ─── G. MILESTONES & CERTIFICATES ───
    const milestoneCards = document.querySelectorAll('.milestone-card, .achieve-card');
    if (milestoneCards.length) {
      gsap.from(milestoneCards, {
        scrollTrigger: {
          trigger: '.milestones-grid, .achievements-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: CONFIG.stagger.milestones,
        ease: CONFIG.ease.editorial
      });
    }

    const certsStrip = document.querySelector('.certifications-strip');
    if (certsStrip) {
      gsap.from(certsStrip, {
        scrollTrigger: {
          trigger: certsStrip,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: CONFIG.ease.editorial
      });
    }

    // ─── H. NUMERIC STATS COUNTERS ───
    document.querySelectorAll('.val[data-count]').forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-count'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      const obj = { count: 0 };

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            count: target,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => {
              counter.textContent = `${Math.floor(obj.count)}${Math.floor(obj.count) === target ? suffix : ''}`;
            }
          });
        }
      });
    });

    // ─── I. CONTACT SECTION & MAGNETIC BUTTON EFFECT ───
    const contactPanels = document.querySelectorAll('.contact-bento > div, .contact-bento');
    if (contactPanels.length) {
      gsap.from(contactPanels, {
        scrollTrigger: {
          trigger: '.contact-bento',
          start: 'top 95%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        stagger: 0.15,
        ease: CONFIG.ease.editorial
      });
    }

    if (isDesktop) {
      document.querySelectorAll('.submit-btn, .nav-cta, .btn.primary').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.25;

          gsap.to(btn, {
            x: x,
            y: y,
            duration: CONFIG.duration.magneticSpeed,
            ease: "power2.out"
          });
        });

        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: CONFIG.duration.magneticSpeed + 0.15,
            ease: CONFIG.ease.editorial
          });
        });
      });
    }
  }

  // ==========================================================================
  // 8. INITIALIZE ON DOM READY
  // ==========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSmoothScroll();
      initCustomCursor();
      initIntroAnimation();
      initScrollAnimations();
    });
  } else {
    initSmoothScroll();
    initCustomCursor();
    initIntroAnimation();
    initScrollAnimations();
  }
})();
