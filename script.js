/* ==========================================================
   script.js — Portfolio Interactions & Animations (Light Cream Minimalist Theme)
   ========================================================== */

(function () {
    'use strict';

    // ─── DOM ELEMENTS ──────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    const scrollProgress = document.getElementById('scrollProgress');

    // ─── SCROLL PROGRESS BAR ────────────────────────────────
    function updateScrollProgress() {
        if (!scrollProgress) return;
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        scrollProgress.style.width = scrolled + '%';
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // ─── ACTIVE NAVBAR LINKS ON SCROLL ──────────────────────
    const navLinkItems = document.querySelectorAll('nav.links a');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNavLink() {
        let currentSectionId = '';
        const scrollPos = window.scrollY + 120; // offset

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                currentSectionId = id;
            }
        });

        navLinkItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });

    // ─── MOBILE HAMBURGER MENU ──────────────────────────────
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu on link click
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.classList.remove('no-scroll');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // ─── INTERSECTION OBSERVER FOR REVEAL & PROGRESS BARS ───
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.12
    };

    let sgpaAnimated = false;
    let skillsAnimated = false;

    function animateSGPABars() {
        if (sgpaAnimated) return;
        sgpaAnimated = true;
        document.querySelectorAll('.sgpa-fill').forEach(bar => {
            const widthVal = bar.getAttribute('data-width');
            if (widthVal) {
                bar.style.width = widthVal + '%';
            }
        });
    }

    function animateSkillBars() {
        if (skillsAnimated) return;
        skillsAnimated = true;
        document.querySelectorAll('.skill-bar i').forEach(bar => {
            const widthVal = bar.getAttribute('data-width');
            if (widthVal) {
                bar.style.width = widthVal;
            }
        });
    }

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');

                // Check if specific sections were revealed
                if (entry.target.id === 'education' || entry.target.querySelector('.sgpa-fill')) {
                    animateSGPABars();
                }
                if (entry.target.id === 'skills' || entry.target.querySelector('.skill-bar')) {
                    animateSkillBars();
                }
            }
        });
    }, observerOptions);

    // Observe reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
        scrollObserver.observe(el);
    });

    // Also observe education and skills specifically just in case
    const eduSection = document.getElementById('education');
    if (eduSection) scrollObserver.observe(eduSection);

    const skillsSection = document.getElementById('skills');
    if (skillsSection) scrollObserver.observe(skillsSection);

    // ─── CONTACT FORM SUBMISSION ────────────────────────────
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simulate form submission success
            showToast();
            contactForm.reset();
        });
    }

    function showToast() {
        if (!toast) return;
        toast.classList.add('visible');
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 4000);
    }

    // ─── SMOOTH ANCHOR SCROLLING WITH OFFSET ────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = 70; // Approximation of header height
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── INITIAL TRIGGER ────────────────────────────────────
    updateScrollProgress();
    updateActiveNavLink();

})();
