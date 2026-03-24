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

            // Submit via API
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Submitting...';
            submitBtn.disabled = true;

            // Backend API base URL
            const API_BASE = 'http://localhost:5000';
            const endpoint = form.getAttribute('action'); // e.g. /api/appointments

            // Determine if form has file inputs (feedback photo, consultancy docs)
            const hasFiles = form.querySelector('input[type="file"]') !== null;

            let fetchOptions;
            if (hasFiles) {
                // Send as FormData (multipart/form-data) — browser sets boundary automatically
                const formData = new FormData(form);
                fetchOptions = {
                    method: 'POST',
                    body: formData,
                };
            } else {
                // Send as JSON for simple forms (appointment, contact)
                fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                };
            }

            fetch(API_BASE + endpoint, fetchOptions)
            .then(response => response.json().then(body => ({ ok: response.ok, body })))
            .then(({ ok, body }) => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                if (!ok) {
                    // Show validation / server errors
                    const errorMsg = body.errors ? body.errors.join('\n') : body.message;
                    alert('Error: ' + errorMsg);
                    return;
                }

                // ── Success ──
                console.log(`Form ${form.id} submitted:`, body);

                // Reset form
                form.reset();
                form.classList.remove('was-validated');

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
                    alert(body.message || 'Submitted successfully! We will contact you soon.');
                }

                // Refresh feedback reviews if on feedback page
                if (window.loadFeedbackReviews) {
                    window.loadFeedbackReviews();
                }
            })
            .catch(error => {
                console.error('Submission error:', error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                alert('Could not connect to the server. Please make sure the backend is running.');
            });
        });
    });

    // ── Date Picker Min Date (prevent past dates for appointments) ──
    const datePicker = document.getElementById('appDate');
    if (datePicker) {
        const today = new Date().toISOString().split('T')[0];
        datePicker.setAttribute('min', today);
    }

    // ═══════════════════════════════════════════
    //  FEEDBACK REVIEWS — Load & Display
    // ═══════════════════════════════════════════

    const API_BASE_REVIEWS = 'http://localhost:5000';
    const reviewsContainer = document.getElementById('reviewsContainer');
    const noReviewsMessage = document.getElementById('noReviewsMessage');

    function generateStarsHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += i <= rating
                ? '<i class="bi bi-star-fill" style="color:#d4a437;"></i>'
                : '<i class="bi bi-star" style="color:#d4a437;"></i>';
        }
        return html;
    }

    function timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHrs < 24) return `${diffHrs} hr ago`;
        if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function renderReviewCard(review) {
        return `
            <div class="col-md-6 col-lg-4" data-animate="fade-up">
                <div class="form-card" style="padding: 24px; height: 100%;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #0a1628, #1a2d4a); display: flex; align-items: center; justify-content: center; color: #d4a437; font-weight: 700; font-size: 18px;">
                            ${review.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h6 style="margin: 0; font-weight: 600; color: #fff;">${review.clientName}</h6>
                            <small style="color: #888;">${timeAgo(review.submittedAt)}</small>
                        </div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        ${generateStarsHTML(review.rating)}
                    </div>
                    <p style="color: #ccc; font-size: 14px; margin-bottom: 8px; line-height: 1.6;">"${review.feedback}"</p>
                    ${review.projectAssociated ? `<small style="color: #d4a437;"><i class="bi bi-building me-1"></i>${review.projectAssociated}</small>` : ''}
                </div>
            </div>
        `;
    }

    function loadFeedbackReviews() {
        if (!reviewsContainer) return; // Not on feedback page

        fetch(API_BASE_REVIEWS + '/api/feedback')
            .then(res => res.json())
            .then(data => {
                if (!data.success || !data.data || data.data.length === 0) {
                    reviewsContainer.innerHTML = '';
                    if (noReviewsMessage) noReviewsMessage.style.display = 'block';
                    return;
                }

                if (noReviewsMessage) noReviewsMessage.style.display = 'none';

                // Render review cards
                reviewsContainer.innerHTML = data.data.map(renderReviewCard).join('');

                // Show average rating
                const avgDisplay = document.getElementById('averageRatingDisplay');
                const avgStars = document.getElementById('avgStars');
                const avgRatingText = document.getElementById('avgRatingText');

                if (avgDisplay && avgStars && avgRatingText) {
                    const totalRating = data.data.reduce((sum, r) => sum + r.rating, 0);
                    const avg = (totalRating / data.data.length).toFixed(1);
                    avgStars.innerHTML = generateStarsHTML(Math.round(parseFloat(avg)));
                    avgRatingText.textContent = `${avg} / 5 — Based on ${data.data.length} review${data.data.length > 1 ? 's' : ''}`;
                    avgDisplay.style.display = 'block';
                }
            })
            .catch(err => {
                console.log('Could not load reviews:', err.message);
                if (noReviewsMessage) noReviewsMessage.style.display = 'block';
            });
    }

    // Load reviews on page load
    loadFeedbackReviews();

    // Make loadFeedbackReviews available globally so it can be called after form submit
    window.loadFeedbackReviews = loadFeedbackReviews;
});
