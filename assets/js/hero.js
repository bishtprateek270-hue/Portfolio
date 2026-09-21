/* ==========================================================================
   PRATEEK SINGH BISHT — HERO SECTION INTERACTION & ENTRANCE ENGINE
   3D Tilt, Chip Parallax, Code Typing & Coordinated Entrance
   ========================================================================== */

(function () {
  'use strict';

  // ─── 1. TUNABLE CONFIGURATION & TOGGLES ───
  // Easily enable/disable or tweak individual effects here
  const HERO_CONFIG = {
    enableTilt: true,          // 3D tilt on portrait card
    enableChipParallax: true,  // Floating glass chips parallax offset
    enableTyping: true,        // Code snippet character-by-character typing
    enableMagneticBtn: true,   // Magnetic pull on Explore Work button
    maxTiltDeg: 5.5,           // Maximum 3D tilt angle (degrees)
    chipParallaxFactor: 0.08,  // Multiplier for chip cursor displacement
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches;

  // ─── 2. 3D TILT ON PORTRAIT & GLASS CHIP PARALLAX ───
  function initPortraitTiltAndParallax() {
    if (reducedMotion || !isDesktop) return;

    const comp = document.querySelector('.hero-portrait-composition');
    const frame = document.querySelector('.portrait-frame-container');
    const chips = document.querySelectorAll('.hero-glass-chip');
    if (!comp || !frame) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let tiltRaf = null;

    function renderTilt() {
      currentRotX += (targetRotX - currentRotX) * 0.14;
      currentRotY += (targetRotY - currentRotY) * 0.14;

      if (HERO_CONFIG.enableTilt) {
        frame.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      }

      if (HERO_CONFIG.enableChipParallax && chips.length) {
        const factor = HERO_CONFIG.chipParallaxFactor;
        chips.forEach((chip, i) => {
          const depth = 1 + (i % 3) * 0.4;
          const px = (-currentRotY * depth * factor * 1.8).toFixed(2);
          const py = (currentRotX * depth * factor * 1.8).toFixed(2);
          chip.style.setProperty('--px', `${px}px`);
          chip.style.setProperty('--py', `${py}px`);
        });
      }

      if (Math.abs(targetRotX - currentRotX) > 0.02 || Math.abs(targetRotY - currentRotY) > 0.02) {
        tiltRaf = requestAnimationFrame(renderTilt);
      } else {
        tiltRaf = null;
      }
    }

    comp.addEventListener('mousemove', (e) => {
      const rect = comp.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;   // -0.5 to 0.5

      targetRotX = -ny * HERO_CONFIG.maxTiltDeg * 2;
      targetRotY = nx * HERO_CONFIG.maxTiltDeg * 2;

      if (!tiltRaf) {
        tiltRaf = requestAnimationFrame(renderTilt);
      }
    });

    comp.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
      if (!tiltRaf) {
        tiltRaf = requestAnimationFrame(renderTilt);
      }
    });
  }

  // ─── 4. CODE SNIPPET TYPING & OUTPUT LINE REVEAL ───
  function initCodeTyping(callback) {
    const snippet = document.getElementById('heroCodeSnippet');
    const outputLine = document.getElementById('codeOutputLine');
    if (!snippet) {
      if (outputLine) outputLine.classList.add('visible');
      if (callback) callback();
      return;
    }

    if (reducedMotion || !HERO_CONFIG.enableTyping) {
      if (outputLine) outputLine.classList.add('visible');
      if (callback) callback();
      return;
    }

    const fullHTML = snippet.innerHTML;
    snippet.innerHTML = '<span class="code-cursor"></span>';

    const textToType = 'def engineer_solution(problem) -> "production_ai":\n    return MachineLearningPipeline(optimize_for="low_latency")';
    let charIndex = 0;

    const interval = setInterval(() => {
      charIndex++;
      if (charIndex >= textToType.length) {
        clearInterval(interval);
        snippet.innerHTML = fullHTML + '<span class="code-cursor"></span>';
        setTimeout(() => {
          if (outputLine) outputLine.classList.add('visible');
          if (callback) callback();
        }, 180);
      } else {
        const partial = textToType.slice(0, charIndex).replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;&nbsp;');
        snippet.innerHTML = partial + '<span class="code-cursor"></span>';
      }
    }, 24);
  }

  // ─── 5. MAGNETIC BUTTON HOVER ───
  function initMagneticButtons() {
    if (!HERO_CONFIG.enableMagneticBtn || reducedMotion || !isDesktop) return;

    const primaryBtn = document.querySelector('.hero-actions .btn.primary');
    if (!primaryBtn) return;

    primaryBtn.addEventListener('mousemove', (e) => {
      const r = primaryBtn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.24;
      const y = (e.clientY - r.top - r.height / 2) * 0.24;
      primaryBtn.style.transform = `translate(${x}px, ${y}px)`;
    });

    primaryBtn.addEventListener('mouseleave', () => {
      primaryBtn.style.transform = 'translate(0px, 0px)';
    });
  }

  // ─── 6. COORDINATED HERO ENTRANCE TIMELINE ───
  let entranceExecuted = false;

  function runHeroEntrance() {
    if (entranceExecuted) return;
    entranceExecuted = true;

    const eyebrow = document.querySelector('.hero-content-col .eyebrow-chip');
    const headlineLines = document.querySelectorAll('.hero-headline-line');
    const subheadline = document.querySelector('.hero-subheadline');
    const leftCard = document.querySelector('.hero-left-card');
    const bioText = document.querySelector('.hero-left-card .bio-text');
    const actions = document.querySelector('.hero-actions');
    const portraitFrame = document.querySelector('.portrait-frame-container');
    const chips = document.querySelectorAll('.hero-glass-chip');
    const currentlyCard = document.querySelector('.hero-currently-card');

    if (reducedMotion || typeof gsap === 'undefined') {
      // Instant reveal for reduced motion
      const allEls = [eyebrow, subheadline, leftCard, bioText, actions, portraitFrame, currentlyCard];
      allEls.forEach(el => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
      if (headlineLines.length) headlineLines.forEach(l => { l.style.transform = 'none'; l.style.opacity = '1'; });
      if (chips.length) chips.forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; });
      if (portraitFrame) portraitFrame.classList.add('idle-floating');
      const outputLine = document.getElementById('codeOutputLine');
      if (outputLine) outputLine.classList.add('visible');
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        if (portraitFrame) portraitFrame.classList.add('idle-floating');
      }
    });

    // 1. Eyebrow Chip (0s)
    if (eyebrow) {
      tl.fromTo(eyebrow, 
        { opacity: 0, y: 16, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.45 }, 
        0
      );
    }

    // 2. Masked Headline Lines Slide-Up (0.1s - 0.75s)
    if (headlineLines.length) {
      tl.fromTo(headlineLines, 
        { yPercent: 110, opacity: 0 }, 
        { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: 'power4.out' }, 
        0.1
      );
    }

    // 3. Subheadline Reveal (0.35s)
    if (subheadline) {
      tl.fromTo(subheadline, 
        { opacity: 0, y: 18 }, 
        { opacity: 1, y: 0, duration: 0.55 }, 
        0.35
      );
    }

    // 4. Left Bento Card (0.45s)
    if (leftCard) {
      tl.fromTo(leftCard, 
        { opacity: 0, y: 24, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }, 
        0.45
      );
    }

    // 5. Code Typing Trigger (0.6s)
    tl.add(() => {
      initCodeTyping();
    }, 0.6);

    // 6. Right Portrait Scale & Fade-in (0.5s)
    if (portraitFrame) {
      tl.fromTo(portraitFrame, 
        { opacity: 0, scale: 0.92, y: 20 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 
        0.5
      );
    }

    // 7. Floating Glass Chips Pop-in (0.85s)
    if (chips.length) {
      tl.fromTo(chips, 
        { opacity: 0, scale: 0.8, y: 14 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'back.out(1.5)' }, 
        0.85
      );
    }

    // 8. "Currently" Card Slide Up (1.05s)
    if (currentlyCard) {
      tl.fromTo(currentlyCard, 
        { opacity: 0, y: 18 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 
        1.05
      );
    }
  }

  // ─── 7. INITIALIZATION & LIFECYCLE HOOKS ───
  function bootHero() {
    initPortraitTiltAndParallax();
    initMagneticButtons();

    // Check if intro has already finished or if we should wait for event
    if (document.body.classList.contains('intro-finished') || sessionStorage.getItem('psb_intro_completed') === 'true') {
      runHeroEntrance();
    } else {
      // Listen for intro completion
      document.addEventListener('intro-finished', runHeroEntrance, { once: true });
      // Fallback: If intro doesn't dispatch in 4 seconds, launch hero entrance
      setTimeout(runHeroEntrance, 4000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootHero);
  } else {
    bootHero();
  }
})();
