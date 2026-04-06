/* ============================================
   AURORA Pro — GSAP ScrollTrigger Animations
   ============================================
   Scroll-driven image sequence playback + 
   section text reveals + parallax effects.
   ============================================ */

const ScrollAnimations = (() => {

    function init() {
        gsap.registerPlugin(ScrollTrigger);

        // Kill any existing ScrollTriggers on re-init
        ScrollTrigger.getAll().forEach(st => st.kill());

        setupImageSequenceScroll();
        setupHeroAnimations();
        setupFeatureAnimations();
        setupSoundSectionAnimation();
        setupProductsAnimation();
        setupReviewsAnimation();
        setupCTAAnimation();
        setupNavbarScroll();

        // Refresh after all setup
        ScrollTrigger.refresh();
    }

    // ===================== IMAGE SEQUENCE SCROLL =====================
    // Core — scrubs through 200 frames as user scrolls within the pinned hero
    function setupImageSequenceScroll() {
        const sequenceObj = { frame: 0 };

        gsap.to(sequenceObj, {
            frame: 199,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: () => '+=12000',
                scrub: 2, // Higher scrub = more inertia = silkier frame transitions
                pin: true,
                anticipatePin: 1
            },
            onUpdate: function () {
                // Use rounded frame for crisp rendering but allow fractional for smooth interpolation
                const progress = sequenceObj.frame / 199;
                ImageSequence.setProgress(progress);
            }
        });
    }

    // ===================== HERO =====================
    function setupHeroAnimations() {
        // Intro title animation (plays once on load)
        const heroTL = gsap.timeline({ delay: 0.3 });

        heroTL
            .to('#heroTag', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            })
            .to('.hero-title-line', {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out'
            }, '-=0.4')
            .to('#heroSubtitle', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.5')
            .to('#scrollIndicator', {
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.3');

        // Fade hero content away as user scrolls down
        gsap.to('.hero-content', {
            opacity: 0,
            y: -100,
            scale: 0.95,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '40% top',
                scrub: true
            }
        });
    }



    // ===================== FEATURES =====================
    function setupFeatureAnimations() {
        const features = ['#feature1', '#feature2', '#feature3', '#feature4'];

        features.forEach((selector, index) => {
            const el = document.querySelector(selector);
            if (!el) return;

            const info = el.querySelector('.feature-info');
            if (!info) return;

            // Main card reveal — scale up from slightly smaller with parallax offset
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1
                }
            });

            tl.fromTo(info, {
                opacity: 0,
                y: 80,
                scale: 0.92,
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                ease: 'power3.out'
            });

            // Stagger children within the card for cascading reveal
            const children = info.querySelectorAll('.feature-number, .feature-title, .feature-desc, .feature-stat');
            tl.fromTo(children, {
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                ease: 'power2.out'
            }, '-=0.5');

            // Fade out on exit
            gsap.to(info, {
                opacity: 0,
                y: -50,
                scale: 0.96,
                ease: 'none',
                scrollTrigger: {
                    trigger: el,
                    start: '55% top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });
    }

    // ===================== SOUND SECTION =====================
    function setupSoundSectionAnimation() {
        // Heading — slide up with scale
        gsap.fromTo('#soundHeading', {
            opacity: 0,
            y: 60,
            scale: 0.95
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#sound',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });

        // Description
        gsap.fromTo('#soundDesc', {
            opacity: 0,
            y: 40,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#sound',
                start: 'top 65%',
                toggleActions: 'play none none reverse'
            }
        });

        // Visualizer canvas — fade in
        gsap.fromTo('.audio-visualizer', {
            opacity: 0,
            scale: 0.95
        }, {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '#sound',
                start: 'top 50%',
                toggleActions: 'play none none reverse'
            }
        });

        // Spec items — staggered scale-up
        gsap.fromTo('.spec-item', {
            opacity: 0,
            y: 30,
            scale: 0.9
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'back.out(1.4)',
            scrollTrigger: {
                trigger: '.sound-specs',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // ===================== CTA =====================
    function setupCTAAnimation() {
        const ctaTL = gsap.timeline({
            scrollTrigger: {
                trigger: '#cta',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        });

        ctaTL
            .fromTo('#ctaCard', {
                opacity: 0,
                y: 80,
                scale: 0.9,
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.4,
                ease: 'power4.out'
            })
            .fromTo('#ctaTitle', {
                opacity: 0,
                y: 30,
                scale: 0.95
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.9')
            .fromTo('#ctaTagline', {
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power3.out'
            }, '-=0.6')
            .fromTo('#ctaPrice', {
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.5')
            .fromTo('.cta-divider', {
                scaleX: 0,
            }, {
                scaleX: 1,
                duration: 0.6,
                ease: 'power2.inOut'
            }, '-=0.4')
            .fromTo('#ctaColors', {
                opacity: 0,
                y: 15,
            }, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out'
            }, '-=0.3')
            .fromTo('#ctaButtons', {
                opacity: 0,
                y: 15,
                scale: 0.95
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.2)'
            }, '-=0.2')
            .fromTo('.cta-features .feature-item', {
                opacity: 0,
                y: 10,
            }, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: 'power2.out'
            }, '-=0.2');
    }

    // ===================== PRODUCTS =====================
    function setupProductsAnimation() {
        gsap.fromTo('#productsHeading', {
            opacity: 0, y: 50, scale: 0.95
        }, {
            opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: '#products', start: 'top 75%', toggleActions: 'play none none reverse' }
        });

        gsap.fromTo('#productsDesc', {
            opacity: 0, y: 30
        }, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '#products', start: 'top 70%', toggleActions: 'play none none reverse' }
        });

        gsap.fromTo('.product-card', {
            opacity: 0, y: 60, scale: 0.9
        }, {
            opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.2)',
            scrollTrigger: { trigger: '#productsGrid', start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }

    // ===================== REVIEWS =====================
    function setupReviewsAnimation() {
        gsap.fromTo('#reviewsHeading', {
            opacity: 0, y: 50, scale: 0.95
        }, {
            opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: '#reviews', start: 'top 75%', toggleActions: 'play none none reverse' }
        });

        gsap.fromTo('.review-card', {
            opacity: 0, y: 50, scale: 0.92
        }, {
            opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(1.3)',
            scrollTrigger: { trigger: '#reviewsGrid', start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }

    // ===================== NAVBAR SCROLL =====================
    function setupNavbarScroll() {
        ScrollTrigger.create({
            start: 'top -80',
            end: 99999,
            onUpdate: (self) => {
                const navbar = document.getElementById('navbar');
                if (!navbar) return;
                if (self.scroll() > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }

    return { init };
})();
