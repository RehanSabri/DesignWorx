// --- 1. REGISTER GSAP PLUGINS ---
gsap.registerPlugin(ScrollTrigger);

// Failsafe: Forces page to show if JS hangs
setTimeout(() => document.body.classList.add('visible'), 3000);

// --- 2. MAIN ANIMATION FUNCTION ---
const initAnimations = () => {
    
    // Safety check: prevent running twice
    if (document.body.classList.contains('animations-initialized')) return;
    document.body.classList.add('animations-initialized');

    // Make body visible IMMEDIATELY so we can see the loader start
    document.body.classList.add('visible');

    console.log("Initializing Animations..."); // Debug Log

    // --- NAVBAR SCROLL EFFECT & LIVE TIME ---
    const navbar = document.querySelector('.navbar');
    const timeDisplay = document.getElementById('timeDisplay');
    
    // Add scroll class for glassmorphism effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Live time display
    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        if (timeDisplay) {
            timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }
    
    updateTime();
    setInterval(updateTime, 1000);

    // --- A. HERO ANIMATION ---
    try {
        const heroSplit = new SplitText(".hero-title", { type: "chars" });
        
        const tl = gsap.timeline();

        // Ensure loader-text starts invisible if not set in CSS
        gsap.set(".loader-text", { opacity: 0 });

        tl.to(".loader-text", { opacity: 1, duration: 1 })
          .to(".loader-text", { opacity: 0, duration: 0.5, delay: 0.2 })
          .to("#loader", { height: 0, duration: 1.2, ease: "expo.inOut" })
          .from(".hero-img-container", { clipPath: "inset(50% 0 50% 0)", duration: 1.5, ease: "expo.inOut" }, "-=1")
          .from(".hero-img", { scale: 1.6, duration: 2, ease: "power2.out" }, "-=1.5")
          .from(heroSplit.chars, { yPercent: 120, stagger: 0.05, duration: 1.2, ease: "power4.out", rotateX: -90 }, "-=1.2");
        
        // ADD SCROLLTRIGGER TO KEEP TEXT VISIBLE WHEN SCROLLING BACK
        ScrollTrigger.create({
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            onEnter: () => {
                gsap.to(heroSplit.chars, { yPercent: 0, rotateX: 0, duration: 0.8, ease: "power4.out", stagger: 0.02 });
            },
            onEnterBack: () => {
                gsap.to(heroSplit.chars, { yPercent: 0, rotateX: 0, duration: 0.8, ease: "power4.out", stagger: 0.02 });
            }
        });
        
    } catch (error) {
        console.error("Hero SplitText failed:", error);
    }

    // --- C. GALLERY HORIZONTAL SCROLL + PROGRESS LINE (FIXED FOR ALL DEVICES) ---
    const track = document.querySelector('.gallery-track');
    const galleryContainer = document.querySelector('.gallery-container');
    
    if(track && galleryContainer) {
        // Function to calculate scroll distance dynamically
        const getScrollWidth = () => {
            const trackWidth = track.scrollWidth;
            const viewportWidth = window.innerWidth;
            return trackWidth - viewportWidth;
        };
        
        // Initial calculation
        let scrollWidth = getScrollWidth();
        
        // Create the animation timeline
        const createGalleryAnimation = () => {
            // Kill existing ScrollTrigger instances for this element
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.vars.trigger === galleryContainer) {
                    trigger.kill();
                }
            });
            
            // Recalculate scroll width
            scrollWidth = getScrollWidth();
            
            console.log("Gallery scroll width:", scrollWidth); // Debug
            
            // Only create animation if there's actual scrolling needed
            if (scrollWidth > 0) {
                const tl = gsap.timeline({
                    scrollTrigger: { 
                        trigger: galleryContainer, 
                        pin: true, 
                        scrub: 1,
                        end: () => `+=${scrollWidth}`,
                        markers: false, // Set to true for debugging
                        anticipatePin: 1,
                        invalidateOnRefresh: true
                    }
                });

                // 1. Move the cards to the left
                tl.to(track, {
                    x: -scrollWidth, 
                    ease: "none"
                })
                // 2. Grow the progress line from 0 to 100% at the same time
                .to(".line", { 
                    scaleX: 1, 
                    ease: "none" 
                }, "<"); // "<" means start at the same time as previous animation
                
                console.log("Gallery animation created successfully");
            } else {
                console.warn("Scroll width is 0 or negative, animation not created");
            }
        };
        
        // Create animation on load
        createGalleryAnimation();
        
        // Recreate on window resize with debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                createGalleryAnimation();
                ScrollTrigger.refresh();
            }, 250);
        });
    }

    // --- H. CARD HOVER EFFECTS (Desktop only) ---
    const cards = document.querySelectorAll('.card');
    const isMobile = window.innerWidth < 768;

    cards.forEach(card => {
        const img = card.querySelector('img');
        const overlay = card.querySelector('.card-overlay');
        
        // Skip hover effects on mobile/tablet
        if (isMobile) {
            // Show overlay by default on mobile
            gsap.set(overlay, { y: 0 });
            return;
        }
        
        // Magnetic effect variables
        let bounds;
        
        card.addEventListener('mouseenter', (e) => {
            bounds = card.getBoundingClientRect();
            
            // Image: Zoom + Brightness
            gsap.to(img, {
                scale: 1.15,
                filter: 'brightness(1.1)',
                duration: 0.8,
                ease: "power3.out"
            });
            
            // Overlay: Slide up
            gsap.to(overlay, {
                y: 0,
                duration: 0.6,
                ease: "power3.out"
            });
            
            // Cursor: Enlarge (only if cursor exists)
            const cursor = document.getElementById('cursor');
            if (cursor) {
                gsap.to(cursor, {
                    scale: 3.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    duration: 0.3
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset image
            gsap.to(img, {
                scale: 1,
                filter: 'brightness(1)',
                duration: 0.8,
                ease: "power3.out"
            });
            
            // Hide overlay
            gsap.to(overlay, {
                y: '100%',
                duration: 0.6,
                ease: "power3.out"
            });
            
            // Reset cursor
            const cursor = document.getElementById('cursor');
            if (cursor) {
                gsap.to(cursor, {
                    scale: 1,
                    backgroundColor: 'white',
                    duration: 0.3
                });
            }
        });
        
        // Magnetic tilt effect (3D perspective) - Desktop only
        card.addEventListener('mousemove', (e) => {
            if (!bounds) return;
            
            const xPos = (e.clientX - bounds.left) / bounds.width;
            const yPos = (e.clientY - bounds.top) / bounds.height;
            
            const tiltX = (yPos - 0.5) * 10; // Vertical tilt
            const tiltY = (xPos - 0.5) * -10; // Horizontal tilt
            
            gsap.to(card, {
                rotationX: tiltX,
                rotationY: tiltY,
                transformPerspective: 1000,
                duration: 0.5,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });

    // --- D. MENU HOVER EFFECT ---
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        const text = link.textContent;
        link.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.classList.add('link-wrapper');
        
        const originalSpan = document.createElement('span');
        originalSpan.classList.add('original-text');
        originalSpan.textContent = text;
        
        const secondarySpan = document.createElement('span');
        secondarySpan.classList.add('secondary-text');
        secondarySpan.textContent = text;
        
        wrapper.appendChild(originalSpan);
        wrapper.appendChild(secondarySpan);
        link.appendChild(wrapper);
        
        try {
            const originalSplit = new SplitText(originalSpan, { type: "chars" });
            const secondarySplit = new SplitText(secondarySpan, { type: "chars" });
            
            link.addEventListener('mouseenter', () => {
                gsap.to(originalSplit.chars, { yPercent: -100, stagger: 0.02, duration: 0.4, ease: "power2.out" });
                gsap.to(secondarySplit.chars, { yPercent: -100, stagger: 0.02, duration: 0.4, ease: "power2.out" });
            });

            link.addEventListener('mouseleave', () => {
                gsap.to(originalSplit.chars, { yPercent: 0, stagger: 0.02, duration: 0.4, ease: "power2.out" });
                gsap.to(secondarySplit.chars, { yPercent: 0, stagger: 0.02, duration: 0.4, ease: "power2.out" });
            });
        } catch (e) { console.log("Menu split error"); }
    });

    // Menu Toggle Logic
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');
    const menuOverlay = document.querySelector('.menu-overlay');

    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuOverlay.classList.add('active');
            gsap.fromTo('.menu-link', 
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2 }
            );
        });
    }
    if(menuClose) {
        menuClose.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
        });
    }

    // --- E. CURSOR LOGIC (Desktop only) ---
    if (window.innerWidth >= 768) {
        const cursor = document.getElementById('cursor');
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
            cursorX += (mouseX - cursorX) * dt;
            cursorY += (mouseY - cursorY) * dt;
            if(cursor) gsap.set(cursor, { x: cursorX, y: cursorY });
        });

        const interactiveElements = document.querySelectorAll('a, .card, .cta, .logo-container, .menu-toggle, .menu-close-btn, .menu-link, .hero-title, .nav-link');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { borderRadius: "0%", scale: 2.5, opacity: 0.8, duration: 0.3, ease: "power2.out" });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { borderRadius: "50%", scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
            });
        });
    }

    // --- F. LENIS SMOOTH SCROLL ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });
    
    // CRITICAL: Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);

    // --- G. SECTION / QUOTE ANIMATION ---
    const quotes = document.querySelectorAll(".quote");

    function setupSplits() {
        quotes.forEach((quote) => {
            if (quote.anim) {
                quote.anim.progress(1).kill();
                quote.split.revert();
            }

            try {
                quote.split = new SplitText(quote, {
                    type: "lines,words,chars",
                    linesClass: "split-line"
                });

                quote.anim = gsap.from(quote.split.chars, {
                    scrollTrigger: {
                        trigger: quote,
                        toggleActions: "play none none reverse",
                        start: "top 80%",
                        markers: false
                    },
                    duration: 0.8,
                    ease: "circ.out",
                    y: 80,
                    stagger: 0.02,
                    opacity: 0
                });
            } catch (error) {
                console.log("Quote split text error:", error);
            }
        });
    }

    ScrollTrigger.addEventListener("refresh", setupSplits);
    setupSplits();

}; // End initAnimations

// --- 3. INITIALIZATION TRIGGERS ---
window.addEventListener("load", initAnimations);

if (document.readyState === "complete") {
    initAnimations();
}