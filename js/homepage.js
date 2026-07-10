/* ═══════════════════════════════════════════
   HOMEPAGE.JS — Dynamic Hero Content Loader
   Fetches editable content from the API and
   injects it into the homepage hero section.
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    var HOMEPAGE_API = 'http://localhost:5000/api/homepage';

    document.addEventListener('DOMContentLoaded', async function () {
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
                // Split line2 into words; first word gets gold, "and" stays normal, rest gets gold
                // Original pattern: "Line1<br> <gold>New</gold> and <gold>Consistent.</gold>"
                // We'll keep the same structure: Line1 <br> <gold>Line2</gold>
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
            // If the API is unavailable, the hardcoded fallback values remain visible
            console.log('[homepage.js] Could not load dynamic content, using defaults.');
        }
    });
})();
