/* ==========================================================================
   PRATEEK SINGH BISHT — GLOBAL BACKGROUND SYSTEM ENGINE
   Scroll-Reactive Section Color Shifts, Spotlight Lerp, Data Line & Visibility
   ========================================================================== */

(function () {
  'use strict';

  // ─── 1. SECTION MOOD PALETTES ───
  const SECTION_MOODS = {
    hero: {
      blob1: 'rgba(37, 99, 235, 0.13)',
      blob2: 'rgba(16, 185, 129, 0.12)',
      blob3: 'rgba(124, 58, 237, 0.09)',
    },
    about: {
      blob1: 'rgba(37, 99, 235, 0.12)',
      blob2: 'rgba(124, 58, 237, 0.12)',
      blob3: 'rgba(99, 102, 241, 0.09)',
    },
    education: {
      blob1: 'rgba(37, 99, 235, 0.12)',
      blob2: 'rgba(16, 185, 129, 0.11)',
      blob3: 'rgba(6, 182, 212, 0.08)',
    },
    skills: {
      blob1: 'rgba(16, 185, 129, 0.13)',
      blob2: 'rgba(37, 99, 235, 0.12)',
      blob3: 'rgba(217, 119, 6, 0.08)',
    },
    projects: {
      blob1: 'rgba(37, 99, 235, 0.13)',
      blob2: 'rgba(139, 92, 246, 0.12)',
      blob3: 'rgba(79, 70, 229, 0.09)',
    },
    experience: {
      blob1: 'rgba(16, 185, 129, 0.13)',
      blob2: 'rgba(20, 184, 166, 0.11)',
      blob3: 'rgba(37, 99, 235, 0.08)',
    },
    achievements: {
      blob1: 'rgba(124, 58, 237, 0.13)',
      blob2: 'rgba(245, 158, 11, 0.09)',
      blob3: 'rgba(37, 99, 235, 0.09)',
    },
    contact: {
      blob1: 'rgba(37, 99, 235, 0.13)',
      blob2: 'rgba(16, 185, 129, 0.12)',
      blob3: 'rgba(124, 58, 237, 0.08)',
    },
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches;

  const bgSystem = document.getElementById('bgSystem') || document.documentElement;
  const spotlightEl = document.getElementById('bgSpotlight');
  const datalineDot = document.getElementById('bgDatalineDot');

  // ─── 2. SCROLL-REACTIVE COLOR SHIFTS (INTERSECTION OBSERVER) ───
  function initSectionMoodObserver() {
    if (reducedMotion) return;

    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          const mood = SECTION_MOODS[sectionId];
          if (mood) {
            bgSystem.style.setProperty('--blob-color-1', mood.blob1);
            bgSystem.style.setProperty('--blob-color-2', mood.blob2);
            bgSystem.style.setProperty('--blob-color-3', mood.blob3);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.15,
    });

    sections.forEach((sec) => observer.observe(sec));
  }

  // ─── 3. LAYER 3: CURSOR SPOTLIGHT WITH LERP IN rAF ───
  function initGlobalSpotlight() {
    if (reducedMotion || !isDesktop || !spotlightEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isMouseActive = false;
    let rafId = null;

    function renderSpotlight() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      spotlightEl.style.setProperty('--mx', `${currentX.toFixed(1)}px`);
      spotlightEl.style.setProperty('--my', `${currentY.toFixed(1)}px`);

      if (isMouseActive && (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1)) {
        rafId = requestAnimationFrame(renderSpotlight);
      } else {
        rafId = null;
      }
    }

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isMouseActive) {
        isMouseActive = true;
        spotlightEl.classList.add('active');
      }

      if (!rafId) {
        rafId = requestAnimationFrame(renderSpotlight);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isMouseActive = false;
      spotlightEl.classList.remove('active');
    });

    document.addEventListener('mouseenter', () => {
      isMouseActive = true;
      spotlightEl.classList.add('active');
    });
  }

  // ─── 4. SIGNATURE TOUCH: TELEMETRY DATA LINE SCROLL TRACKER ───
  function initDataLine() {
    if (reducedMotion || !isDesktop || !datalineDot) return;

    let scrollRaf = null;

    function updateDataLine() {
      const winHeight = window.innerHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = (document.documentElement.scrollHeight - winHeight) || 1;
      const ratio = Math.min(1, Math.max(0, scrollY / maxScroll));

      // Usable track height (leaving 80px margins top and bottom)
      const availableTrack = Math.max(100, winHeight - 160);
      const dotOffset = ratio * availableTrack;

      datalineDot.style.transform = `translateY(${dotOffset.toFixed(1)}px)`;
      scrollRaf = null;
    }

    window.addEventListener('scroll', () => {
      if (!scrollRaf) {
        scrollRaf = requestAnimationFrame(updateDataLine);
      }
    }, { passive: true });

    window.addEventListener('resize', updateDataLine, { passive: true });
    updateDataLine();
  }

  // ─── 5. POWER OPTIMIZATION: PAUSE BLOBS ON HIDDEN TAB ───
  function initTabVisibilityOptimization() {
    const blobsLayer = document.querySelector('.bg-blobs-layer');
    if (!blobsLayer) return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        blobsLayer.style.animationPlayState = 'paused';
        const blobs = document.querySelectorAll('.bg-blob');
        blobs.forEach(b => { b.style.animationPlayState = 'paused'; });
      } else {
        blobsLayer.style.animationPlayState = 'running';
        const blobs = document.querySelectorAll('.bg-blob');
        blobs.forEach(b => { b.style.animationPlayState = 'running'; });
      }
    });
  }

  // ─── 6. BOOTSTRAP ───
  function boot() {
    initSectionMoodObserver();
    initGlobalSpotlight();
    initDataLine();
    initTabVisibilityOptimization();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
