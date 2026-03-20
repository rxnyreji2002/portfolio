// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// --- Custom Cursor Logic ---
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const hoverTargets = document.querySelectorAll('.hover-target, a, button');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let followerX = 0;
let followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Soft mouse parallax for Hero Subtitle
    if (window.innerWidth > 900) {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        gsap.to('.hero-subtitle', { x: -x, y: -y, duration: 1.5, ease: 'power2.out' });
    }
});

// Throttle cursor update to requestAnimationFrame
function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.5;
    cursorY += (mouseY - cursorY) * 0.5;

    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;

    if (cursor) {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
    }
    if (follower) {
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
    }

    requestAnimationFrame(updateCursor);
}
updateCursor();

hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
    });
    target.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
    });
});

// --- Preloader & Hero Sequence ---
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    // 1. Reveal Preloader Title & Counter
    tl.to('.preloader-title', {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1,
        ease: 'power4.inOut'
    })
        .to('.preloader-counter', {
            opacity: 1,
            duration: 0.5
        }, "-=0.5");

    // 2. Animate Counter from 0 to 100
    const counterElement = document.querySelector('.preloader-counter');
    let progress = { val: 0 };
    tl.to(progress, {
        val: 100,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            if (counterElement) {
                counterElement.innerHTML = Math.round(progress.val) + "%";
            }
        }
    });

    // 3. Advanced Preloader Content Outro (Scale & Blur)
    tl.to('.preloader-content', {
        scale: 1.5,
        opacity: 0,
        filter: "blur(15px)",
        duration: 0.8,
        ease: 'power3.in'
    }, "+=0.2");

    // 4. Fluid curtain exit for Preloader background
    tl.to('.preloader', {
        yPercent: -100,
        borderBottomLeftRadius: '50% 100px',
        borderBottomRightRadius: '50% 100px',
        duration: 1.2,
        ease: 'expo.inOut'
    }, "-=0.2");

    // 5. Hero Animations (Aggressive Awwwards-style entry)
    tl.to('.char', {
        y: '0%',
        rotate: 0,
        color: '#ededed',
        webkitTextStroke: '1px transparent',
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.05
    }, "-=0.7");

    // 6. Hero Subtitle & Indicator
    tl.to('.gs-reveal', {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.2
    }, "-=1");

    // Switch text back to stroke style after entry is done
    tl.to('.char', {
        color: 'transparent',
        webkitTextStroke: '1px rgba(255, 255, 255, 0.2)',
        duration: 1,
        ease: 'power2.out',
        stagger: 0.05
    });

    // --- Scroll Skew Effect (Advanced Awwwards feel) ---
    // Objects skew dynamically based on scroll velocity
    let proxy = { skew: 0 },
        skewSetter = gsap.quickSetter(".gs-fade, .interest-card", "skewY", "deg"),
        clamp = gsap.utils.clamp(-2, 3); // Subtly clampe

    ScrollTrigger.create({
        onUpdate: (self) => {
            let skew = clamp(self.getVelocity() / -600); // Requires more speed for less skew
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
                proxy.skew = skew;
                gsap.to(proxy, { skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => skewSetter(proxy.skew) });
            }
        }
    });

    // --- Footer Advanced Animations ---
    // Smooth Scale 'n Slide reveal for entire footer content
    gsap.fromTo('.footer-content',
        { y: 150, scale: 0.9, opacity: 0 },
        {
            y: 0, scale: 1, opacity: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 80%',
                end: 'bottom bottom',
                scrub: 1
            }
        }
    );

    // Staggered character reveal in footer
    gsap.fromTo('.f-char',
        { y: 100, opacity: 0, rotateX: -90 },
        {
            y: 0, opacity: 1, rotateX: 0,
            duration: 1.2,
            stagger: 0.05,
            ease: 'back.out(1.5)',
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 75%'
            }
        }
    );
});


// --- Base ScrollTrigger Animations ---

// Fade up elements on scroll (Universal)
gsap.utils.toArray('.gs-fade').forEach(element => {
    gsap.fromTo(element,
        {
            opacity: 0,
            y: 50
        },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        }
    );
});

// Marquee Text Animation (Moves continuously based on scroll and time)
const marqueeText = document.querySelector('.marquee');
if (marqueeText) {
    let xOffset = 0;

    function animateMarquee() {
        xOffset -= 1;
        if (xOffset < -50) {
            xOffset = 0;
        }
        gsap.set(marqueeText, { xPercent: xOffset });
        requestAnimationFrame(animateMarquee);
    }
    animateMarquee();

    // Speed up on scroll
    ScrollTrigger.create({
        trigger: ".marquee-container",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
            gsap.to(marqueeText, {
                xPercent: () => xOffset - (self.progress * 50),
                ease: 'none',
                duration: 0.1
            });
        }
    });
}

// --- Responsive & MatchMedia Animations ---
let mm = gsap.matchMedia();

// Mobile-Only Animations (max-width: 900px)
mm.add("(max-width: 900px)", () => {

    // 1. Mobile specific Hero zoom effect on scroll
    gsap.to('.hero-title-wrapper', {
        scale: 1.15,
        opacity: 0.5,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // 2. Mobile Eye Candy: 3D Tilt on Scroll for Cards
    const allCards = gsap.utils.toArray('.interest-card, .glass-card');
    allCards.forEach(card => {
        // Perspective wrapper setup
        gsap.set(card.parentNode, { perspective: 800 });

        gsap.fromTo(card,
            {
                rotationX: -15, // Tilt back
                opacity: 0.2,
                transformOrigin: "center center"
            },
            {
                rotationX: 15, // Tilt forward as it leaves view
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: card,
                    start: 'top 95%',
                    end: 'bottom 5%',
                    scrub: true
                }
            }
        );
    });
});

// Desktop-Only Animations (min-width: 901px)
mm.add("(min-width: 901px)", () => {

    // 1. Parallax effect on the About visual card
    gsap.fromTo('.glass-card',
        { y: 70 },
        {
            y: -70,
            ease: 'none',
            scrollTrigger: {
                trigger: '.about',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1 // smooth scrubbing
            }
        }
    );

    // 2. Staggered reveal for interest cards
    gsap.fromTo('.interest-card',
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.interests-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        }
    );
});

// Universal added micro-animation: Magnetic effect on buttons/links
const magneticElements = document.querySelectorAll('.contact-btn, .nav-links a');
magneticElements.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
        });
    });
});

// Card Mouse Glow Tracking
document.querySelectorAll('.interest-card, .glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// --- Mobile Eye Candy: Touch Explosion Ripple ---
// Only active on touch devices to give mobile users an interactive treat
if (window.matchMedia("(pointer: coarse)").matches) {
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];

        // Spawn a new ripple element
        const ripple = document.createElement('div');
        ripple.classList.add('touch-ripple');
        document.body.appendChild(ripple);

        gsap.set(ripple, {
            left: touch.clientX,
            top: touch.clientY,
            width: 10,
            height: 10
        });

        // Animate the ripple expanding and fading out
        gsap.to(ripple, {
            width: 150,
            height: 150,
            opacity: 0,
            duration: 0.6,
            ease: "circ.out",
            onComplete: () => {
                ripple.remove();
            }
        });
    }, { passive: true });
}
