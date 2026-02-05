// Failsafe: Forces page to show if JS hangs
setTimeout(() => document.body.classList.add('visible'), 3000);

document.addEventListener("DOMContentLoaded", () => {
    
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // --- 1. HERO ANIMATION (Stable) ---
    const heroSplit = new SplitText(".hero-title", { type: "chars" });
    
    const tl = gsap.timeline({
        onComplete: () => document.body.classList.add('visible')
    });

    tl.to(".loader-text", { opacity: 1, duration: 1 })
      .to(".loader-text", { opacity: 0, duration: 0.5, delay: 0.2 })
      .to("#loader", { height: 0, duration: 1.2, ease: "expo.inOut" })
      .from(".hero-img-container", { clipPath: "inset(50% 0 50% 0)", duration: 1.5, ease: "expo.inOut" }, "-=1")
      .from(".hero-img", { scale: 1.6, duration: 2, ease: "power2.out" }, "-=1.5")
      .from(heroSplit.chars, { yPercent: 120, stagger: 0.05, duration: 1.2, ease: "power4.out", rotateX: -90 }, "-=1.2");


    // --- 2. MANIFESTO "READER" EFFECT (New & Shiny) ---
    const manifestoSplit = new SplitText(".manifesto", { type: "words" });
    
    // Set initial dim state
    gsap.set(manifestoSplit.words, { opacity: 0.1 });

    // Animate to full opacity on scroll
    gsap.to(manifestoSplit.words, {
        scrollTrigger: {
            trigger: ".manifesto",
            start: "top 85%", 
            end: "bottom 55%",
            scrub: 1
        },
        opacity: 1,
        stagger: 0.1,
        ease: "none"
    });


    // --- 3. GALLERY HORIZONTAL SCROLL ---
    const track = document.querySelector('.gallery-track');
    // Check if track exists to prevent errors
    if(track) {
        const scrollWidth = track.scrollWidth - window.innerWidth;
        gsap.to(track, {
            x: -scrollWidth, ease: "none",
            scrollTrigger: { 
                trigger: ".gallery-container", 
                pin: true, 
                scrub: 1, 
                end: () => "+=" + scrollWidth 
            }
        });
    }


    // --- 4. MENU HOVER EFFECT (Your Code) ---
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


    // --- 5. CURSOR LOGIC (Square Morph) ---
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

    // Hover interactions
    const interactiveElements = document.querySelectorAll('a, .card, .cta, .logo, .menu-toggle, .menu-close-btn, .menu-link, .hero-title');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { borderRadius: "0%", scale: 2.5, opacity: 0.8, duration: 0.3, ease: "power2.out" });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { borderRadius: "50%", scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
        });
    });


    // --- 6. LENIS SMOOTH SCROLL ---
    const lenis = new Lenis();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
});

const quotes = document.querySelectorAll(".quote");

function setupSplits() {
  quotes.forEach((quote) => {
    // Reset if needed
    if (quote.anim) {
      quote.anim.progress(1).kill();
      quote.split.revert();
    }

    quote.split = SplitText.create(quote, {
      type: "words,chars",
      linesClass: "split-line"
    });

    // Set up the anim
    quote.anim = gsap.from(quote.split.chars, {
      scrollTrigger: {
        trigger: quote,
        toggleActions: "restart pause resume reverse",
        start: "top 70%",
        // markers: { startColor: "#dfdcff", endColor: "transparent" }
      },
      duration: 0.6,
      ease: "circ.out",
      y: 80,
      stagger: 0.02
    });
  });
}

ScrollTrigger.addEventListener("refresh", setupSplits);
setupSplits();