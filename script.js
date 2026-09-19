/* ==========================================================
   PRATEEK SINGH BISHT — PORTFOLIO SCRIPT
   Interactive Behaviors, Live Time, Entrance & Scroll Animations
   ========================================================== */

(function () {
    'use strict';

    // ─── DOM ELEMENTS ──────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    const scrollProgress = document.getElementById('scrollProgress');
    const liveClock = document.getElementById('liveClock');

    // ─── LIVE IST / GMT+5:30 CLOCK ─────────────────────────
    function updateLiveClock() {
        if (!liveClock) return;
        const now = new Date();
        const options = {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
        liveClock.textContent = `${timeStr} IST`;
    }

    updateLiveClock();
    setInterval(updateLiveClock, 1000);

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
        const scrollPos = window.scrollY + 140;

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

        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.classList.remove('no-scroll');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // ─── ANIMATED NUMBER COUNTERS ───────────────────────────
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        document.querySelectorAll('.val[data-count]').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            const suffix = counter.getAttribute('data-suffix') || '';
            let count = 0;
            const stepTime = Math.max(20, Math.floor(1200 / target));

            const timer = setInterval(() => {
                count += 1;
                counter.textContent = count + (count === target ? suffix : '');
                if (count >= target) {
                    clearInterval(timer);
                }
            }, stepTime);
        });
    }

    // ─── INTERSECTION OBSERVER FOR REVEAL & METERS ─────────
    const observerOptions = {
        root: null,
        rootMargin: '50px 0px 50px 0px',
        threshold: 0.01
    };

    let sgpaAnimated = false;
    let skillsAnimated = false;

    function animateSGPABars() {
        if (sgpaAnimated) return;
        sgpaAnimated = true;
        document.querySelectorAll('.sgpa-bar').forEach(bar => {
            const widthVal = bar.getAttribute('data-width');
            if (widthVal) {
                bar.style.width = widthVal + '%';
            }
        });
    }

    function animateSkillBars() {
        if (skillsAnimated) return;
        skillsAnimated = true;
        document.querySelectorAll('.meter-bar i').forEach(bar => {
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
                entry.target.classList.add('revealed');

                if (entry.target.id === 'education' || entry.target.querySelector('.sgpa-bar')) {
                    animateSGPABars();
                }
                if (entry.target.id === 'skills' || entry.target.querySelector('.meter-bar')) {
                    animateSkillBars();
                }
                if (entry.target.id === 'hero' || entry.target.querySelector('[data-count]')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        scrollObserver.observe(el);
    });

    const heroSection = document.getElementById('hero');
    if (heroSection) {
        scrollObserver.observe(heroSection);
        // Trigger counter animation on page start
        setTimeout(animateCounters, 700);
    }

    const eduSection = document.getElementById('education');
    if (eduSection) scrollObserver.observe(eduSection);

    const skillsSection = document.getElementById('skills');
    if (skillsSection) scrollObserver.observe(skillsSection);

    // ─── VIDEO DEMO MODAL CONTROLLER ────────────────────────
    const videoModal = document.getElementById('videoModal');
    const modalBackdrop = document.getElementById('videoModalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalProjectTitle = document.getElementById('modalProjectTitle');
    const modalProjectDesc = document.getElementById('modalProjectDesc');
    const modalVideoPlayer = document.getElementById('modalVideoPlayer');
    const modalRepoBtn = document.getElementById('modalRepoBtn');

    function openVideoModal(title, desc, videoSrc, repoSrc) {
        if (!videoModal) return;
        if (modalProjectTitle) modalProjectTitle.textContent = title || 'Project Demo';
        if (modalProjectDesc) modalProjectDesc.textContent = desc || '';
        if (modalVideoPlayer) modalVideoPlayer.src = videoSrc || '';
        if (modalRepoBtn) {
            modalRepoBtn.href = repoSrc || '#';
            modalRepoBtn.style.display = repoSrc ? 'inline-flex' : 'none';
        }
        videoModal.classList.add('open');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function closeVideoModal() {
        if (!videoModal) return;
        videoModal.classList.remove('open');
        videoModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        if (modalVideoPlayer) {
            modalVideoPlayer.src = '';
        }
    }

    document.querySelectorAll('.video-demo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const title = btn.getAttribute('data-title');
            const desc = btn.getAttribute('data-desc');
            const video = btn.getAttribute('data-video');
            const repo = btn.getAttribute('data-repo');
            openVideoModal(title, desc, video, repo);
        });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('open')) {
            closeVideoModal();
        }
    });

    // ─── CONTACT FORM SUBMISSION ────────────────────────────
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
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

    // ─── SMOOTH ANCHOR SCROLLING ────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = 70;
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── INITIAL RUN ────────────────────────────────────────
    updateScrollProgress();
    updateActiveNavLink();
})();
