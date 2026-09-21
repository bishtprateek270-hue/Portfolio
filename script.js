/* ==========================================================
   PRATEEK SINGH BISHT — CORE PORTFOLIO SCRIPT
   Interactive Behaviors, Live Time, Modal, Contact Form & UI
   ========================================================== */

(function () {
    'use strict';

    // ─── DOM ELEMENTS ──────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
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

    // ─── MOBILE HAMBURGER MENU ──────────────────────────────
    if (hamburger && navLinks) {
        const navLinkItems = navLinks.querySelectorAll('a');

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

    // ─── ANCHOR SMOOTH SCROLL FALLBACK (if Lenis not available) ───
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement && typeof Lenis === 'undefined') {
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
})();
