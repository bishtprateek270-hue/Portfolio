/* ==========================================================================
   PRATEEK SINGH BISHT — MASTER ANIMATION ENGINE
   GSAP 3 + ScrollTrigger + Flip + Lenis Smooth Scroll
   ========================================================================== */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. TUNABLE CONFIGURATION
     ──────────────────────────────────────────────────────────── */
  const CONFIG = {
    dur: {
      fast: 0.3,
      base: 0.6,
      heading: 0.75,
      card: 0.7,
      meter: 1.2,
      magnetic: 0.35,
    },
    ease: {
      out: 'power3.out',
      smooth: 'power4.out',
      expo: 'expo.out',
      inOut: 'power3.inOut',
      bounce: 'back.out(1.4)',
    },
    stagger: {
      fast: 0.04,
      base: 0.08,
      cards: 0.12,
    },
  };

  /* ────────────────────────────────────────────────────────────
     2. ENVIRONMENT & CAPABILITIES DETECTION
     ──────────────────────────────────────────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;

  if (typeof gsap === 'undefined') {
    console.warn('[PSB Anim] GSAP is not loaded.');
    document.body.classList.add('intro-finished');
    return;
  }

  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  if (typeof Flip !== 'undefined') gsap.registerPlugin(Flip);

  let lenisInstance = null;

  /* ────────────────────────────────────────────────────────────
     3. LENIS SMOOTH SCROLL INTEGRATION
     ──────────────────────────────────────────────────────────── */
  function initLenis() {
    if (reducedMotion || typeof Lenis === 'undefined') return;

    try {
      lenisInstance = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
      });

      lenisInstance.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        if (lenisInstance) {
          lenisInstance.raf(time * 1000);
        }
      });

      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn('[PSB Anim] Lenis init skipped:', e);
    }
  }

  /* ────────────────────────────────────────────────────────────
     4. INTRO PRELOADER & SEAMLESS HERO HANDOFF (TASK 1)
     ──────────────────────────────────────────────────────────── */
  function initIntro() {
    const overlay = document.getElementById('introOverlay');
    const heroPortrait = document.getElementById('heroPortrait');
    const introPhoto = document.getElementById('introPhoto');
    const introPhotoMask = document.getElementById('introPhotoMask');
    const skipBtn = document.getElementById('introSkipBtn');
    const progressFill = document.getElementById('introProgressFill');
    const counter = document.getElementById('introCounter');
    const footerStatus = document.getElementById('introFooterStatus');
    const nameEl = document.getElementById('introName');
    const roleEl = document.getElementById('introRole');
    const tagline = document.getElementById('introTagline');
    const chips = document.querySelectorAll('.intro-chip');
    const storyBox = document.getElementById('introStoryBox');
    const storyText = document.getElementById('introStoryText');
    const glow1 = document.querySelector('.intro-glow-1');
    const glow2 = document.querySelector('.intro-glow-2');

    // Check sessionStorage for repeat visits
    let introAlreadySeen = false;
    try {
      introAlreadySeen = sessionStorage.getItem('psb_intro_completed') === 'true';
    } catch (err) {
      introAlreadySeen = false;
    }

    // Bypass intro immediately if seen or reduced-motion requested
    if (introAlreadySeen || reducedMotion || !overlay) {
      if (overlay) overlay.remove();
      finishIntro(false);
      return;
    }

    // Preload intro photo before launching timeline
    const photoPreload = new Promise((resolve) => {
      const img = new Image();
      img.src = introPhoto ? introPhoto.src : 'assets/images/prateek.jpg';
      if (img.complete && img.naturalWidth > 0) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 1500);
      }
    });

    photoPreload.then(() => {
      // Set initial intro element positions
      gsap.set(introPhotoMask, { clipPath: 'inset(100% 0% 0% 0% round 24px)', opacity: 0, scale: 0.95 });
      gsap.set(introPhoto, { scale: 1.35 });
      if (nameEl) gsap.set(nameEl, { yPercent: 110 });
      if (roleEl) gsap.set(roleEl, { opacity: 0, y: 15 });
      if (tagline) gsap.set(tagline, { opacity: 0, y: 20 });
      if (chips.length) gsap.set(chips, { opacity: 0, y: 15, scale: 0.9 });
      if (storyBox) gsap.set(storyBox, { opacity: 0, scaleX: 0.9, transformOrigin: 'left center' });
      if (storyText) gsap.set(storyText, { opacity: 0, y: 10 });
      if (glow1) gsap.set(glow1, { scale: 0.8, opacity: 0 });
      if (glow2) gsap.set(glow2, { scale: 0.8, opacity: 0 });

      const introTl = gsap.timeline({
        onComplete: () => finishIntro(true),
      });

      // 1. Ambient Lighting
      if (glow1) introTl.to(glow1, { opacity: 0.8, scale: 1.15, duration: 2.5, ease: 'power2.out' }, 0.2);
      if (glow2) introTl.to(glow2, { opacity: 0.65, scale: 1.1, duration: 3.0, ease: 'power2.out' }, 0.4);

      // 2. Photo Mask Unveil
      introTl.to(introPhotoMask, {
        clipPath: 'inset(0% 0% 0% 0% round 24px)',
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'power3.out',
      }, 0.2);

      introTl.to(introPhoto, {
        scale: 1.05,
        duration: 6.0,
        ease: 'power1.out',
      }, 0.2);

      // 3. Name & Identity
      if (nameEl) introTl.to(nameEl, { yPercent: 0, duration: 1.0, ease: 'power3.out' }, 0.8);
      if (roleEl) introTl.to(roleEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.2);
      if (tagline) introTl.to(tagline, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 1.6);

      // 4. Highlight Chips
      if (chips.length) {
        introTl.to(chips, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: CONFIG.ease.bounce,
        }, 2.2);
      }

      // 5. Story Box
      if (storyBox) introTl.to(storyBox, { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power3.out' }, 2.9);
      if (storyText) introTl.to(storyText, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 3.1);

      // 6. Counter 000% -> 100% & Progress Track
      const counterVal = { v: 0 };
      introTl.to(counterVal, {
        v: 100,
        duration: 5.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          const val = Math.floor(counterVal.v);
          if (counter) counter.textContent = `${String(val).padStart(3, '0')}%`;
          if (progressFill) progressFill.style.width = `${val}%`;
          if (footerStatus) {
            if (val < 35) footerStatus.textContent = 'INITIALIZING CORE ASSETS...';
            else if (val < 70) footerStatus.textContent = 'ARCHITECTING ML PIPELINES...';
            else if (val < 95) footerStatus.textContent = 'SYSTEM VERIFIED & OPTIMIZED...';
            else footerStatus.textContent = 'SYSTEM INITIALIZED • READY';
          }
        },
      }, 0.3);

      // 7. Handoff Climax at 100%
      introTl.to({}, { duration: 0.3 }, 5.5);

      // Seamless Photo Flip into Hero
      introTl.add(() => {
        if (typeof Flip !== 'undefined' && heroPortrait && introPhoto) {
          const state = Flip.getState(introPhoto);
          heroPortrait.parentElement.appendChild(introPhoto);
          Flip.from(state, {
            duration: 0.85,
            ease: 'power3.inOut',
            onComplete: () => {
              if (introPhoto.parentElement !== introPhotoMask) {
                introPhoto.remove();
              }
            },
          });
        }
      }, 5.8);

      // Overlay Curtain Reveal
      introTl.to(overlay, {
        yPercent: -100,
        opacity: 0.95,
        duration: 0.85,
        ease: 'power3.inOut',
      }, 5.8);

      // Skip Button Handler
      if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
          e.preventDefault();
          introTl.kill();
          finishIntro(true);
        });
      }
    });

    function finishIntro(animated) {
      document.body.classList.add('intro-finished');
      try {
        sessionStorage.setItem('psb_intro_completed', 'true');
      } catch (e) {}

      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => overlay.remove(),
        });
      }

      // Launch Hero Entrance Timeline
      playHeroEntrance(animated);

      // Refresh ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh(true);
        setTimeout(() => ScrollTrigger.refresh(true), 250);
      }
    }
  }

  /* ────────────────────────────────────────────────────────────
     5. HERO ENTRANCE TIMELINE (TASK 2)
     ──────────────────────────────────────────────────────────── */
  function playHeroEntrance(animate) {
    const nav = document.querySelector('.nav');
    const topBar = document.querySelector('.top-status-bar');
    const eyebrow = document.querySelector('.eyebrow-chip');
    const headlineLines = document.querySelectorAll('.hero-headline-line');
    const subheadline = document.querySelector('.hero-subheadline');
    const bioCard = document.querySelector('.bento-bio-card');
    const portraitCard = document.querySelector('.bento-portrait-card');
    const metricsStrip = document.querySelector('.metrics-strip');
    const metricVals = document.querySelectorAll('.metrics-strip .val[data-count]');

    if (!animate || reducedMotion) {
      if (nav) gsap.set(nav, { y: 0, opacity: 1 });
      if (topBar) gsap.set(topBar, { y: 0, opacity: 1 });
      if (headlineLines.length) gsap.set(headlineLines, { yPercent: 0, opacity: 1 });
      if (portraitCard) portraitCard.classList.add('hero-floating');
      animateCounters(metricVals);
      return;
    }

    const heroTl = gsap.timeline({
      defaults: { ease: CONFIG.ease.out },
      onComplete: () => {
        if (portraitCard) portraitCard.classList.add('hero-floating');
      },
    });

    // 1. Top Bar & Navbar Drop Down
    if (topBar) {
      heroTl.fromTo(topBar, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5 });
    }
    if (nav) {
      heroTl.fromTo(nav, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 }, '-=0.35');
    }

    // 2. Eyebrow Chip Pop
    if (eyebrow) {
      heroTl.fromTo(eyebrow, { opacity: 0, y: 18, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, '-=0.2');
    }

    // 3. Headline Masked Line-by-Line Slide-Up
    if (headlineLines.length) {
      heroTl.fromTo(headlineLines, 
        { yPercent: 110, opacity: 0 }, 
        { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.14, ease: CONFIG.ease.smooth }, 
        '-=0.3'
      );
    }

    // 4. Subheadline Reveal
    if (subheadline) {
      heroTl.fromTo(subheadline, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
    }

    // 5. Bento Bio Card + Portrait Card
    if (bioCard) {
      heroTl.fromTo(bioCard, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.35');
    }
    if (portraitCard) {
      heroTl.fromTo(portraitCard, { opacity: 0, scale: 0.95, y: 25 }, { opacity: 1, scale: 1, y: 0, duration: 0.7 }, '-=0.5');
    }

    // 6. Code Snippet Typing Animation
    heroTl.add(() => {
      typeHeroCodeSnippet();
    }, '-=0.3');

    // 7. Metrics Strip Entrance + Numbers Count Up
    if (metricsStrip) {
      heroTl.fromTo(metricsStrip, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.2');
      heroTl.add(() => {
        animateCounters(metricVals);
      }, '-=0.2');
    }
  }

  /* Code snippet typing effect */
  function typeHeroCodeSnippet() {
    const snippet = document.getElementById('heroCodeSnippet');
    if (!snippet || snippet.dataset.typed === 'true') return;
    snippet.dataset.typed = 'true';

    const fullHTML = snippet.innerHTML;
    snippet.innerHTML = '<span class="code-cursor"></span>';

    const textToType = 'def engineer_solution(problem) -> "production_ai":\n    return MachineLearningPipeline(optimize_for="low_latency")';
    let charIndex = 0;

    const interval = setInterval(() => {
      charIndex++;
      if (charIndex >= textToType.length) {
        clearInterval(interval);
        snippet.innerHTML = fullHTML + '<span class="code-cursor"></span>';
      } else {
        const partial = textToType.slice(0, charIndex).replace(/\n/g, '<br>');
        snippet.innerHTML = partial + '<span class="code-cursor"></span>';
      }
    }, 28);
  }

  /* Number count-up helper */
  function animateCounters(elements) {
    if (!elements || !elements.length) return;
    elements.forEach((el) => {
      if (el.dataset.animated === 'true') return;
      el.dataset.animated = 'true';

      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;

      const obj = { n: 0 };
      gsap.to(obj, {
        n: target,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => {
          const val = Math.floor(obj.n);
          el.textContent = `${val}${val === target ? suffix : ''}`;
        },
      });
    });
  }

  /* ────────────────────────────────────────────────────────────
     6. GLOBAL SCROLL EFFECTS (TASK 3)
     ──────────────────────────────────────────────────────────── */
  function initGlobalScrollEffects() {
    // ── A. Scroll Progress Bar ──
    const progressEl = document.getElementById('scrollProgress');
    if (progressEl) {
      gsap.to(progressEl, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.15,
        },
      });
    }

    // ── B. Smart Sticky Navbar (Hide on scroll down, show on up, glass on scroll) ──
    const nav = document.querySelector('.nav');
    if (nav) {
      let lastScroll = 0;
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          const currentScroll = self.scroll();

          // Add glass blur after 60px
          if (currentScroll > 60) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }

          // Smart hide on scroll down, show on up
          if (currentScroll > 150 && self.direction === 1) {
            nav.classList.add('nav-hidden');
          } else {
            nav.classList.remove('nav-hidden');
          }

          lastScroll = currentScroll;
        },
      });
    }

    // ── C. Scroll-Spy for Navigation Links ──
    const navLinks = document.querySelectorAll('nav.links a');
    const sections = document.querySelectorAll('section[id]');

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (self.isActive) {
            const id = section.getAttribute('id');
            navLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        },
      });
    });

    // ── D. Section Headers Reveal ──
    document.querySelectorAll('.sec-head:not(.skills-head)').forEach((head) => {
      const idx = head.querySelector('.sec-index');
      const h2 = head.querySelector('h2');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: head,
          start: 'top 88%',
          once: true,
        },
      });

      if (idx) {
        tl.fromTo(idx, 
          { opacity: 0, x: -24 }, 
          { opacity: 1, x: 0, duration: 0.5, ease: CONFIG.ease.out }
        );
      }
      if (h2) {
        tl.fromTo(h2, 
          { opacity: 0, y: 28 }, 
          { opacity: 1, y: 0, duration: CONFIG.dur.heading, ease: CONFIG.ease.smooth }, 
          idx ? '-=0.3' : 0
        );
      }
    });
  }

  /* ────────────────────────────────────────────────────────────
     7. SECTION-SPECIFIC ANIMATIONS (TASK 4)
     ──────────────────────────────────────────────────────────── */
  function initSectionSpecificAnimations() {
    if (reducedMotion) return;

    // ── A. Section 01: About ──
    const aboutSec = document.getElementById('about');
    if (aboutSec) {
      const paragraphs = aboutSec.querySelectorAll('.about-text-col p');
      const chips = aboutSec.querySelectorAll('.about-chips .chip-item');
      const summaryCard = aboutSec.querySelector('.about-summary-card');

      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSec,
          start: 'top 85%',
          once: true,
        },
      });

      if (paragraphs.length) {
        aboutTl.fromTo(paragraphs, 
          { opacity: 0, y: 25 }, 
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: CONFIG.ease.out }
        );
      }

      if (chips.length) {
        aboutTl.fromTo(chips, 
          { opacity: 0, scale: 0.88, y: 15 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.08, ease: CONFIG.ease.bounce }, 
          '-=0.3'
        );
      }

      if (summaryCard) {
        aboutTl.fromTo(summaryCard, 
          { opacity: 0, y: 30, scale: 0.96 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: CONFIG.ease.smooth }, 
          '-=0.4'
        );
      }
    }

    // ── B. Section 02: Education & SGPA Meters ──
    const eduSec = document.getElementById('education');
    if (eduSec) {
      const eduCard = eduSec.querySelector('.education-card');
      const sgpaBars = eduSec.querySelectorAll('.sgpa-bar');

      if (eduCard) {
        gsap.fromTo(eduCard, 
          { opacity: 0, y: 30 }, 
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: CONFIG.ease.out,
            scrollTrigger: { trigger: eduSec, start: 'top 85%', once: true },
          }
        );
      }

      if (sgpaBars.length) {
        sgpaBars.forEach((bar) => {
          const targetWidth = bar.getAttribute('data-width') || '80';
          gsap.fromTo(bar, 
            { width: '0%' }, 
            {
              width: `${targetWidth}%`,
              duration: CONFIG.dur.meter,
              ease: CONFIG.ease.smooth,
              scrollTrigger: { trigger: bar, start: 'top 92%', once: true },
            }
          );
        });
      }
    }

    // ── C. Section 03: Technical Stack ──
    const skillsSec = document.getElementById('skills');
    if (skillsSec) {
      const idx = skillsSec.querySelector('.sec-index');
      const h2 = skillsSec.querySelector('h2');
      const subtitle = skillsSec.querySelector('.sec-subtitle');
      const sweep = skillsSec.querySelector('.heading-light-sweep');
      const cards = skillsSec.querySelectorAll('.skills-grid-5 .skill-card');

      const skillsTl = gsap.timeline({
        scrollTrigger: {
          trigger: skillsSec,
          start: 'top 85%',
          once: true,
        },
      });

      if (idx) skillsTl.fromTo(idx, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: CONFIG.ease.out });
      if (h2) skillsTl.fromTo(h2, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, ease: CONFIG.ease.smooth }, idx ? '-=0.2' : 0);
      if (subtitle) skillsTl.fromTo(subtitle, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: CONFIG.ease.out }, '-=0.25');
      if (sweep) skillsTl.fromTo(sweep, { left: '-100%' }, { left: '160%', duration: 0.8, ease: 'power2.out' }, '-=0.3');

      if (cards.length) {
        skillsTl.fromTo(cards, 
          { opacity: 0, y: 35, scale: 0.95 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.09, ease: CONFIG.ease.smooth }, 
          '-=0.4'
        );

        cards.forEach((card, ci) => {
          const chips = card.querySelectorAll('.tech-chip');
          if (chips.length) {
            skillsTl.fromTo(chips, 
              { opacity: 0, y: 8, scale: 0.92 }, 
              { opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.02, ease: 'power2.out' }, 
              `-=${0.45 - ci * 0.04}`
            );
          }
        });
      }

      // Desktop 3D Card Hover Glow & Tilt
      if (isDesktop) {
        cards.forEach((card) => {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const rx = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -2;
            const ry = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 2;
            gsap.to(card, { rotationX: rx, rotationY: ry, transformPerspective: 1000, duration: 0.25, ease: 'power2.out' });
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.45, ease: CONFIG.ease.smooth });
          });
        });
      }
    }

    // ── D. Section 04: Projects (Signature Horizontal Pinned Scroll) ──
    initProjectsScroll();

    // ── E. Section 05: Experience Timeline (Dynamic Drawing Line) ──
    const expSec = document.getElementById('experience');
    if (expSec) {
      const lineFill = document.getElementById('timelineProgress');
      const timelineCard = expSec.querySelector('.timeline-card');
      const listItems = expSec.querySelectorAll('.timeline-list li');

      if (lineFill) {
        gsap.fromTo(lineFill, 
          { height: '0%' }, 
          {
            height: '100%',
            ease: 'none',
            scrollTrigger: {
              trigger: expSec,
              start: 'top 75%',
              end: 'bottom 70%',
              scrub: 0.3,
            },
          }
        );
      }

      if (timelineCard) {
        gsap.fromTo(timelineCard, 
          { opacity: 0, y: 35 }, 
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: CONFIG.ease.out,
            scrollTrigger: { trigger: expSec, start: 'top 80%', once: true },
          }
        );
      }

      if (listItems.length) {
        gsap.fromTo(listItems, 
          { opacity: 0, x: -15 }, 
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: CONFIG.ease.out,
            scrollTrigger: { trigger: expSec, start: 'top 75%', once: true },
          }
        );
      }
    }

    // ── F. Section 06: Milestones & Certifications ──
    const achieveSec = document.getElementById('achievements');
    if (achieveSec) {
      const milestoneCards = achieveSec.querySelectorAll('.milestone-card');
      const certChips = achieveSec.querySelectorAll('.cert-chip');

      if (milestoneCards.length) {
        gsap.fromTo(milestoneCards, 
          { opacity: 0, y: 30, scale: 0.94 }, 
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: CONFIG.stagger.cards,
            ease: CONFIG.ease.smooth,
            scrollTrigger: { trigger: achieveSec, start: 'top 85%', once: true },
          }
        );
      }

      if (certChips.length) {
        gsap.fromTo(certChips, 
          { opacity: 0, x: 25 }, 
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: CONFIG.ease.out,
            scrollTrigger: { trigger: '.certifications-strip', start: 'top 90%', once: true },
          }
        );
      }
    }

    // ── G. Section 07: Contact Section ──
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      const h2 = contactSec.querySelector('h2');
      const infoPanel = contactSec.querySelector('.contact-info-panel');
      const formPanel = contactSec.querySelector('.contact-form-panel');
      const contactLinks = contactSec.querySelectorAll('.contact-links-list .c-link');

      const contactTl = gsap.timeline({
        scrollTrigger: {
          trigger: contactSec,
          start: 'top 85%',
          once: true,
        },
      });

      if (h2) contactTl.fromTo(h2, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.7, ease: CONFIG.ease.smooth });
      if (infoPanel) contactTl.fromTo(infoPanel, { opacity: 0, x: -25 }, { opacity: 1, x: 0, duration: 0.6, ease: CONFIG.ease.out }, '-=0.4');
      if (formPanel) contactTl.fromTo(formPanel, { opacity: 0, x: 25 }, { opacity: 1, x: 0, duration: 0.6, ease: CONFIG.ease.out }, '-=0.5');

      if (contactLinks.length) {
        contactTl.fromTo(contactLinks, 
          { opacity: 0, y: 12 }, 
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: CONFIG.ease.out }, 
          '-=0.3'
        );
      }

      // Desktop Magnetic Links & Submit Button
      if (isDesktop) {
        document.querySelectorAll('.submit-btn, .nav-cta, .btn.primary, .contact-links-list .c-link').forEach((btn) => {
          btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.25;
            const y = (e.clientY - r.top - r.height / 2) * 0.25;
            gsap.to(btn, { x, y, duration: CONFIG.dur.magnetic, ease: 'power2.out' });
          });

          btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: CONFIG.dur.magnetic + 0.15, ease: CONFIG.ease.smooth });
          });
        });
      }
    }
  }

  /* ────────────────────────────────────────────────────────────
     8. SIGNATURE MOMENT: PROJECTS PINNED HORIZONTAL SCROLL
     ──────────────────────────────────────────────────────────── */
  function initProjectsScroll() {
    const projectsSec = document.getElementById('projects');
    const track = document.getElementById('projectsTrack');
    const activeIndexBadge = document.getElementById('projectActiveIndex');
    const cards = document.querySelectorAll('#projects .project-card');

    if (!projectsSec || !track || !cards.length) return;

    // DESKTOP: Pinned Horizontal Scroll
    if (isDesktop && !reducedMotion) {
      // Calculate total horizontal scroll distance
      const getScrollAmount = () => {
        return track.scrollWidth - window.innerWidth + window.innerWidth * 0.15;
      };

      const horizontalTween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: projectsSec,
          pin: true,
          scrub: 0.8,
          start: 'top top',
          end: () => `+=${getScrollAmount()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Update active project index (01 - 09) based on scroll progress
            const progress = self.progress;
            const total = cards.length;
            const currentIdx = Math.min(total, Math.max(1, Math.floor(progress * total) + 1));
            if (activeIndexBadge) {
              activeIndexBadge.textContent = String(currentIdx).padStart(2, '0');
            }

            // Highlight active card
            cards.forEach((card, i) => {
              if (i === currentIdx - 1) {
                card.classList.add('active-center');
              } else {
                card.classList.remove('active-center');
              }
            });
          },
        },
      });

      // Desktop 3D Card Hover
      cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -3;
          const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 3;
          gsap.to(card, { rotationX: rx, rotationY: ry, transformPerspective: 1000, duration: 0.3, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.5, ease: CONFIG.ease.smooth });
        });
      });
    } else {
      // MOBILE / TABLET: Vertical Staggered Fade-Up
      cards.forEach((card, i) => {
        gsap.fromTo(card, 
          { opacity: 0, y: 35 }, 
          {
            opacity: 1,
            y: 0,
            duration: CONFIG.dur.card,
            delay: (i % 2) * 0.08,
            ease: CONFIG.ease.smooth,
            scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          }
        );
      });
    }
  }

  /* ────────────────────────────────────────────────────────────
     9. BOOTSTRAP & RESIZE HANDLING
     ──────────────────────────────────────────────────────────── */
  function init() {
    initLenis();
    initIntro();
    initGlobalScrollEffects();
    initSectionSpecificAnimations();

    // Window Resize & Orientation Change
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 250);
    });

    // Window Load
    window.addEventListener('load', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
