/* ============================================
   AURORA Pro — Main Entry Point
   ============================================
   Initialization, loading screen, audio visualizer,
   cursor glow, mobile nav, and boot sequence.
   ============================================ */

(function () {
    'use strict';

    // ===================== LOADING SCREEN =====================
    const Loader = {
        el: document.getElementById('loader'),
        bar: document.getElementById('loaderBar'),
        countEl: document.getElementById('loaderCount'),

        /** Update progress display */
        setProgress(percent) {
            if (this.bar) this.bar.style.width = percent + '%';
            if (this.countEl) this.countEl.textContent = percent + '%';
        },

        /** Hide the loading screen and start the experience */
        complete() {
            this.setProgress(100);
            setTimeout(() => {
                if (this.el) this.el.classList.add('hidden');
                document.body.style.overflow = '';
                // Initialize scroll animations after loader hides
                ScrollAnimations.init();
            }, 600);
        }
    };

    // ===================== AUDIO VISUALIZER =====================
    const AudioVisualizer = {
        canvas: null,
        ctx: null,
        bars: 64,
        animId: null,
        isVisible: false,

        init() {
            this.canvas = document.getElementById('audio-visualizer');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize(), { passive: true });

            // Only animate when visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    this.isVisible = e.isIntersecting;
                    if (this.isVisible && !this.animId) this.animate();
                    if (!this.isVisible && this.animId) {
                        cancelAnimationFrame(this.animId);
                        this.animId = null;
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(this.canvas);
        },

        resize() {
            if (!this.canvas) return;
            const parent = this.canvas.parentElement;
            const dpr = window.devicePixelRatio || 1;
            const w = Math.min(parent.offsetWidth, 800);
            this.canvas.width = w * dpr;
            this.canvas.height = 200 * dpr;
            this.canvas.style.width = w + 'px';
            this.canvas.style.height = '200px';
        },

        animate() {
            if (!this.isVisible) return;
            this.animId = requestAnimationFrame(() => this.animate());

            const { ctx, canvas } = this;
            const w = canvas.width;
            const h = canvas.height;
            const t = Date.now() * 0.002;
            const barWidth = w / this.bars;
            const dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < this.bars; i++) {
                const freq1 = Math.sin(t + i * 0.15) * 0.5 + 0.5;
                const freq2 = Math.sin(t * 1.3 + i * 0.22) * 0.3 + 0.3;
                const freq3 = Math.sin(t * 0.7 + i * 0.08) * 0.2 + 0.2;
                const amplitude = (freq1 + freq2 + freq3) / 3;
                const barH = amplitude * h * 0.7;

                const grad = ctx.createLinearGradient(0, h - barH, 0, h);
                const hue = 250 + (i / this.bars) * 50;
                grad.addColorStop(0, `hsla(${hue}, 80%, 65%, 0.9)`);
                grad.addColorStop(1, `hsla(${hue + 20}, 70%, 40%, 0.3)`);

                ctx.fillStyle = grad;

                const x = i * barWidth + barWidth * 0.15;
                const bw = barWidth * 0.7;
                const radius = Math.min(bw / 2, 4 * dpr);
                const y = h - barH;

                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + bw - radius, y);
                ctx.quadraticCurveTo(x + bw, y, x + bw, y + radius);
                ctx.lineTo(x + bw, h);
                ctx.lineTo(x, h);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.fill();

                // Top glow
                ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
                ctx.shadowBlur = 8 * dpr;
                ctx.fillRect(x, y, bw, 2 * dpr);
                ctx.shadowBlur = 0;
            }
        }
    };

    // ===================== CURSOR GLOW =====================
    const CursorGlow = {
        el: null,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,

        init() {
            if (window.matchMedia('(pointer: coarse)').matches) return;

            this.el = document.createElement('div');
            this.el.className = 'cursor-glow';
            document.body.appendChild(this.el);

            document.addEventListener('mousemove', (e) => {
                this.targetX = e.clientX;
                this.targetY = e.clientY;
            }, { passive: true });

            this.animate();
        },

        animate() {
            this.x += (this.targetX - this.x) * 0.08;
            this.y += (this.targetY - this.y) * 0.08;

            if (this.el) {
                this.el.style.transform = `translate(${this.x - 150}px, ${this.y - 150}px)`;
            }

            requestAnimationFrame(() => this.animate());
        }
    };

    // ===================== MOBILE NAV =====================
    const MobileNav = {
        init() {
            const btn = document.getElementById('navMenuBtn');
            const links = document.getElementById('navLinks');
            if (!btn || !links) return;

            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                links.classList.toggle('open');
            });

            links.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    btn.classList.remove('active');
                    links.classList.remove('open');
                });
            });
        }
    };

    // ===================== COLOR SWATCHES =====================
    const ColorSwatches = {
        init() {
            const swatches = document.querySelectorAll('.color-swatch');
            swatches.forEach(swatch => {
                swatch.addEventListener('click', () => {
                    swatches.forEach(s => s.classList.remove('active'));
                    swatch.classList.add('active');
                });
            });
        }
    };

    // ===================== SMOOTH SCROLL (LENIS) =====================
    const SmoothScroll = {
        lenis: null,
        init() {
            this.lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            });

            // Integrate with GSAP ScrollTrigger
            this.lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                this.lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);

            // Anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (target) {
                        this.lenis.scrollTo(target);
                        // Also close mobile menu if open
                        const btn = document.getElementById('navMenuBtn');
                        const links = document.getElementById('navLinks');
                        if(btn) btn.classList.remove('active');
                        if(links) links.classList.remove('open');
                    }
                });
            });
        }
    };

    // ===================== BOOT SEQUENCE =====================
    function boot() {
        // Lock scroll during load
        document.body.style.overflow = 'hidden';

        // Initialize UI components
        MobileNav.init();
        ColorSwatches.init();
        SmoothScroll.init();
        CursorGlow.init();
        AudioVisualizer.init();

        // Initialize image sequence with progress tracking
        ImageSequence.init({
            onProgress: (percent) => {
                Loader.setProgress(percent);
            },
            onReady: () => {
                Loader.complete();
            }
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
