/* ═══════════════════════════════════════════
   HOMEPAGE.JS — Dynamic Hero Content Loader
   Fetches editable content from the API and
   injects it into the homepage hero section.
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    var HOMEPAGE_API = 'https://prapti-associates.onrender.com/api/homepage';
    var SERVICES_API = 'https://prapti-associates.onrender.com/api/services?activeOnly=true';

    document.addEventListener('DOMContentLoaded', function () {
        // Run both fetches independently so one doesn't block the other
        loadHeroContent();
        loadHomeServices();
    });

    // ── Load Hero Content ──
    async function loadHeroContent() {
        try {
            var res = await fetch(HOMEPAGE_API);
            var json = await res.json();

            if (!json.success || !json.data) return;

            var d = json.data;

            // Badge
            var badge = document.getElementById('homeBadge');
            if (badge && d.heroBadge) {
                badge.innerHTML = '<i class="bi bi-award-fill"></i> ' + d.heroBadge;
            }

            // Heading
            var title = document.getElementById('homeHeroTitle');
            if (title && d.heroHeadingLine1 && d.heroHeadingLine2) {
                title.innerHTML = d.heroHeadingLine1 + '<br /><span class="text-gold">' + d.heroHeadingLine2 + '</span>';
            }

            // Description
            var desc = document.getElementById('homeHeroDesc');
            if (desc && d.heroDescription) {
                desc.textContent = d.heroDescription;
            }

            // Primary Button
            var primaryBtn = document.getElementById('homePrimaryBtn');
            if (primaryBtn) {
                if (d.primaryBtnText) {
                    primaryBtn.innerHTML = d.primaryBtnText + ' <i class="bi bi-arrow-right"></i>';
                }
                if (d.primaryBtnLink) {
                    primaryBtn.href = d.primaryBtnLink;
                }
            }

            // Secondary Button
            var secondaryBtn = document.getElementById('homeSecondaryBtn');
            if (secondaryBtn) {
                if (d.secondaryBtnText) {
                    secondaryBtn.innerHTML = d.secondaryBtnText + ' <i class="bi bi-arrow-right"></i>';
                }
                if (d.secondaryBtnLink) {
                    secondaryBtn.href = d.secondaryBtnLink;
                }
            }

            // Statistics
            var s1n = document.getElementById('homeStat1Number');
            var s1l = document.getElementById('homeStat1Label');
            var s2n = document.getElementById('homeStat2Number');
            var s2l = document.getElementById('homeStat2Label');
            var s3n = document.getElementById('homeStat3Number');
            var s3l = document.getElementById('homeStat3Label');

            if (s1n && d.stat1Number) s1n.textContent = d.stat1Number;
            if (s1l && d.stat1Label) s1l.textContent = d.stat1Label;
            if (s2n && d.stat2Number) s2n.textContent = d.stat2Number;
            if (s2l && d.stat2Label) s2l.textContent = d.stat2Label;
            if (s3n && d.stat3Number) s3n.textContent = d.stat3Number;
            if (s3l && d.stat3Label) s3l.textContent = d.stat3Label;

        } catch (error) {
            console.log('[homepage.js] Could not load dynamic content, using defaults.');
        }
    }

    // ── Load Services Dynamically ──
    async function loadHomeServices() {
        var servicesGrid = document.getElementById('homeServicesGrid');
        if (!servicesGrid) return;

        try {
            var sRes = await fetch(SERVICES_API);
            var sData = await sRes.json();

            if (sData.success && sData.data && sData.data.length > 0) {
                servicesGrid.innerHTML = '';
                sData.data.forEach(function (service, index) {
                    var isElevated = (index % 2 !== 0) ? ' elevated' : '';
                    var delay = index * 200;
                    var iconClass = service.icon || 'bi-tools';

                    var col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4';
                    // Note: do NOT add data-animate here — main.js observer runs before
                    // dynamic cards are injected, so they would never become visible.

                    col.innerHTML =
                        '<div class="service-card' + isElevated + '">' +
                            '<div class="service-icon"><i class="bi ' + iconClass + '"></i></div>' +
                            '<h4 class="service-title">' + service.name + '</h4>' +
                            '<p class="service-desc">' + service.description + '</p>' +
                            '<a href="services.html" class="btn btn-service">' +
                                'Get Started <i class="bi bi-arrow-right-circle"></i>' +
                            '</a>' +
                        '</div>';

                    servicesGrid.appendChild(col);
                });

                // Show carousel arrows if more than 3 services
                var arrows = document.getElementById('serviceArrows');
                if (arrows && sData.data.length > 3) {
                    arrows.style.display = '';
                }
            } else {
                servicesGrid.innerHTML =
                    '<div class="col-12 text-center py-4">' +
                        '<p class="text-muted">No services available at the moment.</p>' +
                    '</div>';
            }
        } catch (error) {
            console.log('[homepage.js] Could not load services, showing fallback.');
            servicesGrid.innerHTML =
                '<div class="col-12 text-center py-4">' +
                    '<p class="text-muted">Services could not be loaded. Please try again later.</p>' +
                '</div>';
        }
    }
})();
