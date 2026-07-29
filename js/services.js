/* ═══════════════════════════════════════════
   SERVICES.JS — Dynamic Loading for Public Services
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    // ── Set this to your backend API URL ──
    var SERVICES_API = 'http://localhost:5000/api/services?activeOnly=true';

    document.addEventListener('DOMContentLoaded', async function () {
        var servicesGrid = document.getElementById('servicesGrid');

        if (!servicesGrid) return;

        try {
            var res = await fetch(SERVICES_API);
            var data = await res.json();

            if (data.success && data.data && data.data.length > 0) {
                renderServices(servicesGrid, data.data);
            } else if (data.success && (!data.data || data.data.length === 0)) {
                servicesGrid.innerHTML =
                    '<div class="col-12 text-center py-5">' +
                        '<p class="text-muted">No services available at the moment.</p>' +
                    '</div>';
            } else {
                servicesGrid.innerHTML =
                    '<div class="col-12 text-center py-5">' +
                        '<p class="text-danger">Failed to load services. Please try again later.</p>' +
                    '</div>';
            }
        } catch (error) {
            console.error('[services.js] Fetch error:', error);
            servicesGrid.innerHTML =
                '<div class="col-12 text-center py-5">' +
                    '<p class="text-danger">Failed to connect to the server. Please make sure the backend is running.</p>' +
                '</div>';
        }
    });

    function renderServices(container, services) {
        container.innerHTML = '';

        services.forEach(function (service, index) {
            var isAccent = (index % 2 !== 0) ? 'accent' : '';
            var delay = (index % 3) * 100;
            var iconClass = service.icon || 'bi-tools';

            var col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6';

            // Use a small staggered timeout so cards animate in sequentially
            setTimeout(function () {
                col.innerHTML =
                    '<div class="service-card-full ' + isAccent + '">' +
                        '<div class="service-icon-lg"><i class="bi ' + iconClass + '"></i></div>' +
                        '<h4>' + service.name + '</h4>' +
                        '<p>' + service.description + '</p>' +
                        '<a href="consultancy.html" class="btn btn-service">Request Consultation <i class="bi bi-arrow-right-circle"></i></a>' +
                    '</div>';

                // Trigger fade-in animation manually
                col.style.opacity = '0';
                col.style.transform = 'translateY(30px)';
                col.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                requestAnimationFrame(function () {
                    col.style.opacity = '1';
                    col.style.transform = 'translate(0, 0)';
                });
            }, delay);

            container.appendChild(col);
        });
    }
})();
