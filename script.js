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

// --- Page Load Animations (Hero Section) ---
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    // Animate Title characters
    tl.to('.char', {
        y: '0%',
        duration: 1,
        ease: 'power4.out',
        stagger: 0.05,
        delay: 0.2
    });

    // Reveal Subtitle & Scroll Indicator
    tl.to('.gs-reveal', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.2
    }, "-=0.5");
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
        if(xOffset < -50) { 
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

    // 2. Mobile Interest Cards Slide-in from Sides
    const cards = gsap.utils.toArray('.interest-card');
    cards.forEach((card, i) => {
        gsap.fromTo(card, 
            { 
                x: i % 2 === 0 ? -100 : 100, // Alternate sides
                opacity: 0 
            },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // 3. Floating effect on the About visual glass card for mobile
    gsap.to('.glass-card', {
        y: 15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
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

// Universal added micro-animation: Magnetic effect on contact button
const contactBtn = document.querySelector('.contact-btn');
if(contactBtn) {
    contactBtn.addEventListener('mousemove', (e) => {
        const rect = contactBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(contactBtn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    contactBtn.addEventListener('mouseleave', () => {
        gsap.to(contactBtn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
        });
    });
}
