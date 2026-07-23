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

        // Update scroll progress bar width
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        const progressBar = document.getElementById('scrollProgress');
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }

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

    // ─── TYPEWRITER EFFECT ──────────────────────────────────
    const roles = [
        "AI & ML Engineering Student",
        "Full-Stack Web Developer",
        "Creative UI/UX Designer",
        "Problem Solver & Innovator"
    ];
    let currentRoleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const typedRoleElement = document.getElementById('typedRole');
    const typingDelay = 100;
    const erasingDelay = 50;
    const newTextDelay = 2000;

    function typeRole() {
        if (!typedRoleElement) return;
        const currentRole = roles[currentRoleIndex];

        if (isDeleting) {
            currentCharIndex--;
            typedRoleElement.textContent = currentRole.substring(0, currentCharIndex);
        } else {
            currentCharIndex++;
            typedRoleElement.textContent = currentRole.substring(0, currentCharIndex);
        }

        let delay = isDeleting ? erasingDelay : typingDelay;

        if (!isDeleting && currentCharIndex === currentRole.length) {
            isDeleting = true;
            delay = newTextDelay;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentRoleIndex = (currentRoleIndex + 1) % roles.length;
            delay = 500;
        }

        setTimeout(typeRole, delay);
    }

    // ─── CANVAS PARTICLES ───────────────────────────────────
    function initParticles() {
        const canvas = document.getElementById('heroParticles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = canvas.offsetWidth);
        let height = (canvas.height = canvas.offsetHeight);

        const particles = [];
        const properties = {
            bgColor: 'transparent',
            particleColor: 'rgba(99, 102, 241, 0.45)',
            lineColor: 'rgba(99, 102, 241, 0.08)',
            particleRadius: 2.5,
            particleCount: 75,
            maxSpeed: 0.6,
            lineLength: 120,
        };

        let mouse = { x: null, y: null };

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        });

        const hero = document.getElementById('hero');
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                const rect = hero.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });

            hero.addEventListener('mouseleave', () => {
                mouse.x = null;
                mouse.y = null;
            });
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.velocityX = (Math.random() * 2 - 1) * properties.maxSpeed;
                this.velocityY = (Math.random() * 2 - 1) * properties.maxSpeed;
            }

            position() {
                if (this.x + this.velocityX > width || this.x + this.velocityX < 0) {
                    this.velocityX = -this.velocityX;
                }
                if (this.y + this.velocityY > height || this.y + this.velocityY < 0) {
                    this.velocityY = -this.velocityY;
                }
                this.x += this.velocityX;
                this.y += this.velocityY;
            }

            reDraw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, properties.particleRadius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = properties.particleColor;
                ctx.fill();
            }
        }

        function drawLines() {
            let x1, y1, x2, y2, length, opacity;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    x1 = particles[i].x;
                    y1 = particles[i].y;
                    x2 = particles[j].x;
                    y2 = particles[j].y;
                    length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

                    if (length < properties.lineLength) {
                        opacity = 1 - length / properties.lineLength;
                        ctx.lineWidth = '0.5';
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.18})`;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
        }

        function updateParticles() {
            for (let i = 0; i < particles.length; i++) {
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        const force = (100 - dist) / 100;
                        particles[i].x += (dx / dist) * force * 1.5;
                        particles[i].y += (dy / dist) * force * 1.5;
                    }
                }

                particles[i].position();
                particles[i].reDraw();
            }
        }

        function loop() {
            ctx.clearRect(0, 0, width, height);
            drawLines();
            updateParticles();
            requestAnimationFrame(loop);
        }

        for (let i = 0; i < properties.particleCount; i++) {
            particles.push(new Particle());
        }

        loop();
    }

    // ─── MAGNETIC BUTTONS ───────────────────────────────────
    function initMagneticButtons() {
        const magneticElements = document.querySelectorAll('.btn, .nav-logo');

        magneticElements.forEach(elem => {
            elem.addEventListener('mousemove', (e) => {
                const rect = elem.getBoundingClientRect();
                const x = e.clientX - rect.left - (rect.width / 2);
                const y = e.clientY - rect.top - (rect.height / 2);

                elem.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });

            elem.addEventListener('mouseleave', () => {
                elem.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    // ─── INITIALIZATION ─────────────────────────────────────
    if (typedRoleElement) {
        setTimeout(typeRole, 1000);
    }
    initParticles();
    initMagneticButtons();

})();
