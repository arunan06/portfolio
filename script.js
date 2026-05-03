document.addEventListener('DOMContentLoaded', () => {
    // Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Page loader — hide after load
    const loader = document.getElementById('pageLoader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 400);
    });
    // Fallback if load already fired
    if (document.readyState === 'complete') {
        setTimeout(() => loader.classList.add('hidden'), 400);
    }

    // Touch detection
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    if (isTouch) {
        if (dot) dot.style.display = 'none';
        if (outline) outline.style.display = 'none';
        document.documentElement.style.cursor = 'auto';
    } else if (dot && outline) {
        let mx = 0, my = 0, ox = 0, oy = 0;

        window.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
        });

        // Smooth trailing outline using lerp
        function lerpCursor() {
            ox += (mx - ox) * 0.12;
            oy += (my - oy) * 0.12;
            outline.style.left = ox + 'px';
            outline.style.top = oy + 'px';
            requestAnimationFrame(lerpCursor);
        }
        lerpCursor();

        // Cursor hover grow
        document.querySelectorAll('a, button, .project-card, .about-card, .social-btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                outline.style.width = '55px';
                outline.style.height = '55px';
                outline.style.backgroundColor = 'rgba(0,240,255,0.08)';
            });
            el.addEventListener('mouseleave', () => {
                outline.style.width = '40px';
                outline.style.height = '40px';
                outline.style.backgroundColor = 'transparent';
            });
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        lastScroll = window.scrollY;
    }, { passive: true });

    // Reveal on scroll (with staggered delays via data-delay)
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay || 0);
                setTimeout(() => entry.target.classList.add('visible'), delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));

    // Project card mouse glow
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    // Smooth anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Canvas particles (lightweight)
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.r = Math.random() * 1.2 + 0.3;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 120);
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = dx * dx + dy * dy;
                if (dist < 8000) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - dist / 8000)})`;
                    ctx.lineWidth = 0.4;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
});
