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


  // ── Testimonial Carousel (Dynamic from API) ──
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const track = document.getElementById('testimonialTrack');
  const noTestimonialsMsg = document.getElementById('noTestimonialsMsg');
  let currentSlide = 0;
  let slides = [];

  function generateStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= rating
        ? '<i class="bi bi-star-fill"></i>'
        : '<i class="bi bi-star"></i>';
    }
    return html;
  }

  function buildTestimonialCard(review) {
    const initial = review.clientName.charAt(0).toUpperCase();
    const project = review.projectAssociated || 'Client';
    const stars = generateStars(review.rating);
    return `
      <div class="testimonial-card" style="display:flex;flex-direction:column;">
        <div class="testimonial-header">
          <div style="width:55px;height:55px;min-width:55px;border-radius:50%;background:linear-gradient(135deg,#d4a437,#b8892e);display:flex;align-items:center;justify-content:center;color:#0a1628;font-weight:700;font-size:20px;border:2px solid #d4a437;">
            ${initial}
          </div>
          <div>
            <h5 class="testimonial-name">${review.clientName}</h5>
            <span class="testimonial-role">${project}</span>
          </div>
        </div>
        <p class="testimonial-text" style="flex:1;">"${review.feedback}"</p>
        <div class="testimonial-stars">${stars}</div>
      </div>
    `;
  }

  function renderTestimonials(feedbackData) {
    if (!track) return;

    if (!feedbackData || feedbackData.length === 0) {
      if (noTestimonialsMsg) noTestimonialsMsg.style.display = 'block';
      return;
    }

    // Group reviews into slides of 2
    const slideGroups = [];
    for (let i = 0; i < feedbackData.length; i += 2) {
      slideGroups.push(feedbackData.slice(i, i + 2));
    }

    // Build slide HTML using CSS grid (not Bootstrap row/col which conflicts with carousel flex)
    track.innerHTML = slideGroups.map((group, idx) => `
      <div class="testimonial-slide ${idx === 0 ? 'active' : ''}">
        <div style="display:grid;grid-template-columns:${group.length > 1 ? '1fr 1fr' : '1fr'};gap:20px;align-items:stretch;">
          ${group.map(review => buildTestimonialCard(review)).join('')}
        </div>
      </div>
    `).join('');

    // Update slides reference
    slides = document.querySelectorAll('.testimonial-slide');

    // Show average rating
    const avgDisplay = document.getElementById('homeAvgRating');
    const avgStars = document.getElementById('homeAvgStars');
    const avgText = document.getElementById('homeAvgText');
    if (avgDisplay && avgStars && avgText) {
      const total = feedbackData.reduce((sum, r) => sum + r.rating, 0);
      const avg = (total / feedbackData.length).toFixed(1);
      avgStars.innerHTML = generateStars(Math.round(parseFloat(avg)));
      avgText.textContent = `${avg} / 5 — Based on ${feedbackData.length} review${feedbackData.length > 1 ? 's' : ''}`;
      avgDisplay.style.display = 'block';
    }
  }

  function goToSlide(index) {
    if (slides.length === 0) return;
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Fetch testimonials from API
  if (track) {
    fetch('http://localhost:5000/api/feedback')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          renderTestimonials(data.data);
          // Start auto-slide after loading
          let autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
          const carouselEl = document.getElementById('testimonialCarousel');
          if (carouselEl) {
            carouselEl.addEventListener('mouseenter', () => clearInterval(autoSlide));
            carouselEl.addEventListener('mouseleave', () => {
              autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
            });
          }
        }
      })
      .catch(err => {
        console.log('Could not load testimonials:', err.message);
        if (noTestimonialsMsg) noTestimonialsMsg.style.display = 'block';
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
