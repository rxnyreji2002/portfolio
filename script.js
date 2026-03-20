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

// --- ScrollTrigger Animations ---

// Fade up elements on scroll
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
    
    // Slow continuous movement
    function animateMarquee() {
        xOffset -= 1; // Speed
        if(xOffset < -50) { // Reset when one exact loop finishes (depends on text width, approx 50% for duplicated)
            xOffset = 0;
            // A more robust implementation would measure the child width, but this provides the aesthetic out of the box.
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

// Parallax effect on the About visual card
gsap.fromTo('.glass-card', 
    { y: 50 },
    {
        y: -50,
        ease: 'none',
        scrollTrigger: {
            trigger: '.about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    }
);
