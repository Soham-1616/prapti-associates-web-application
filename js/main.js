/* ═══════════════════════════════════════════
   PRAPTI ASSOCIATES — MAIN JAVASCRIPT
   Handles: Navbar, Hamburger, Carousel,
   Scroll Animations, Smooth Scroll
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky Navbar with Background Change ──
  const navbar = document.getElementById('mainNav');
  const scrollThreshold = 60;

  function handleNavScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll(); // initial check


  // ── Mobile Hamburger Toggle ──
  const toggler = document.getElementById('navToggler');
  const navCollapse = document.getElementById('navbarNav');

  if (toggler && navCollapse) {
    toggler.addEventListener('click', () => {
      toggler.classList.toggle('active');
      navCollapse.classList.toggle('show');
    });

    // Close menu when a nav link is clicked
    navCollapse.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggler.classList.remove('active');
        navCollapse.classList.remove('show');
      });
    });
  }


  // ── Active Nav Link on Scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);


  // ── Testimonial Carousel ──
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const track = document.querySelector('.testimonial-track');
  let currentSlide = 0;

  function goToSlide(index) {
    if (slides.length === 0) return;

    // Wrap around
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentSlide = index;

    // Move track
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update active class
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Auto-advance every 5 seconds
  let autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);

  // Pause auto-slide on hover
  const carouselEl = document.getElementById('testimonialCarousel');
  if (carouselEl) {
    carouselEl.addEventListener('mouseenter', () => clearInterval(autoSlide));
    carouselEl.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
    });
  }


  // ── Scroll-Triggered Fade-In Animations ──
  const animatedEls = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('animated');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedEls.forEach(el => observer.observe(el));


  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

});
