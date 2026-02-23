/* ═══════════════════════════════════════════
   FORMS.JS — Form Validation & AJAX Submit
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Star Rating Widget ──
    const starRating = document.getElementById('starRating');
    if (starRating) {
        const stars = starRating.querySelectorAll('i[data-rating]');
        const ratingValue = document.getElementById('ratingValue');
        const ratingText = document.getElementById('ratingText');
        const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                highlightStars(rating);
            });

            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                ratingValue.value = rating;
                highlightStars(rating);
                ratingText.textContent = labels[rating];
                // Set stars as filled permanently
                stars.forEach((s, idx) => {
                    if (idx < rating) {
                        s.className = 'bi bi-star-fill active';
                    } else {
                        s.className = 'bi bi-star';
                    }
                });
            });
        });

        starRating.addEventListener('mouseleave', () => {
            const currentRating = parseInt(ratingValue.value);
            highlightStars(currentRating);
        });

        function highlightStars(rating) {
            stars.forEach((s, idx) => {
                if (idx < rating) {
                    s.className = 'bi bi-star-fill active';
                } else {
                    s.className = 'bi bi-star';
                }
            });
        }
    }

    // ── Form Validation & Submit ──
    const forms = document.querySelectorAll('#appointmentForm, #consultancyForm, #feedbackForm, #contactForm');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Basic validation
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            // Check star rating if on feedback form
            if (form.id === 'feedbackForm') {
                const ratingVal = document.getElementById('ratingValue');
                if (ratingVal && ratingVal.value === '0') {
                    alert('Please select a star rating.');
                    return;
                }
            }

            // Collect form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Simulate AJAX submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Submitting...';
            submitBtn.disabled = true;

            // Simulate API call with timeout
            setTimeout(() => {
                console.log(`Form ${form.id} submitted:`, data);

                // Reset form
                form.reset();
                form.classList.remove('was-validated');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Reset star rating if present
                if (starRating) {
                    const ratingValueEl = document.getElementById('ratingValue');
                    if (ratingValueEl) ratingValueEl.value = '0';
                    const ratingTextEl = document.getElementById('ratingText');
                    if (ratingTextEl) ratingTextEl.textContent = 'Click to rate';
                    const allStars = starRating.querySelectorAll('i[data-rating]');
                    allStars.forEach(s => s.className = 'bi bi-star');
                }

                // Show success modal
                const successModal = document.getElementById('successModal');
                if (successModal) {
                    const modal = new bootstrap.Modal(successModal);
                    modal.show();
                } else {
                    alert('Submitted successfully! We will contact you soon.');
                }
            }, 1500);
        });
    });

    // ── Date Picker Min Date (prevent past dates for appointments) ──
    const datePicker = document.getElementById('appDate');
    if (datePicker) {
        const today = new Date().toISOString().split('T')[0];
        datePicker.setAttribute('min', today);
    }
});
