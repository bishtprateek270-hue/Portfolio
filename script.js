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

    // ─── CONTACT FORM SUBMISSION (FORMSUBMIT AJAX) ─────────
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Send Message</span>';

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const subject = subjectInput ? subjectInput.value.trim() : 'Portfolio Inquiry';
            const message = messageInput ? messageInput.value.trim() : '';

            const payload = {
                name: name,
                email: email,
                subject: subject,
                message: message,
                _subject: `Portfolio Message from ${name}: ${subject}`,
                _captcha: 'false',
                _template: 'table'
            };

            // Set loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> <span>Sending...</span>';
            }

            try {
                const response = await fetch('https://formsubmit.co/ajax/bishtprateek270@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    showToast("Message sent successfully! I'll get back to you soon.", false);
                    contactForm.reset();
                } else {
                    throw new Error(`Server returned HTTP ${response.status}`);
                }
            } catch (err) {
                console.error('Contact form submission error:', err);
                showToast("Could not send message automatically. Please email bishtprateek270@gmail.com directly.", true);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    let toastTimer = null;
    function showToast(message, isError = false) {
        if (!toast) return;
        const toastMessageEl = document.getElementById('toastMessage');
        if (toastMessageEl && message) {
            toastMessageEl.textContent = message;
        }

        if (isError) {
            toast.classList.add('error');
        } else {
            toast.classList.remove('error');
        }

        toast.classList.add('visible');

        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('visible');
            toast.classList.remove('error');
        }, 5500);
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
