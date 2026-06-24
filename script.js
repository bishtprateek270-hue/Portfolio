/* ==========================================================
   script.js — Portfolio Interactions & Animations
   ========================================================== */

(function () {
    'use strict';

    // ─── DOM ELEMENTS ──────────────────────────────────────
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    const allNavLinks = document.querySelectorAll('.nav-links a');

    // ─── NAVBAR SCROLL ─────────────────────────────────────
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.scrollY;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;

        // Update active nav link
        updateActiveNav();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ─── ACTIVE NAV LINK ────────────────────────────────────
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);

            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    allNavLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }

    // ─── MOBILE MENU ────────────────────────────────────────
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // ─── SCROLL ANIMATIONS ──────────────────────────────────
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate SGPA bars when visible
                if (entry.target.closest('#education')) {
                    animateSGPABars();
                }

                // Animate stat counters when visible
                if (entry.target.closest('.hero-stats')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });

    // ─── COUNTER ANIMATION ──────────────────────────────────
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        document.querySelectorAll('.stat-number').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 1500;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);

                counter.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // ─── SGPA BAR ANIMATION ─────────────────────────────────
    let sgpaAnimated = false;

    function animateSGPABars() {
        if (sgpaAnimated) return;
        sgpaAnimated = true;

        document.querySelectorAll('.sgpa-fill').forEach(bar => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = width + '%';
            }, 200);
        });
    }

    // ─── CONTACT FORM ───────────────────────────────────────
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Show toast notification
        showToast();

        // Reset form
        contactForm.reset();
    });

    function showToast() {
        toast.classList.add('visible');
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3500);
    }

    // ─── PROJECT CARD TILT EFFECT ───────────────────────────
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ─── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── INITIAL STATE ──────────────────────────────────────
    // Trigger initial scroll check
    handleScroll();

    // Add loaded class to body for initial animations
    document.body.classList.add('loaded');

    // Force hero elements to be visible immediately
    document.querySelectorAll('.hero .animate-on-scroll').forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, 200 + (i * 150));
    });

})();
