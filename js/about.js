/* ═══════════════════════════════════════════
   ABOUT.JS — Dynamic Loading for About Page
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    var ABOUT_API = 'http://localhost:5000/api/about';

    document.addEventListener('DOMContentLoaded', async function () {
        var introTitle = document.getElementById('aboutIntroTitle');
        var descContainer = document.getElementById('aboutIntroDescContainer');
        var aboutImage = document.getElementById('aboutImageElement');
        var expYears = document.getElementById('aboutExpYears');
        var expLabel = document.getElementById('aboutExpLabel');
        var missionText = document.getElementById('aboutMissionText');
        var visionText = document.getElementById('aboutVisionText');
        var valuesText = document.getElementById('aboutValuesText');

        try {
            var res = await fetch(ABOUT_API);
            var json = await res.json();

            if (!json.success || !json.data) return;

            var d = json.data;

            // Introduction Title
            if (introTitle && d.introTitle) {
                // If it contains "Dreams", wrap it in the text-gold class
                var text = d.introTitle;
                if (text.indexOf('Dreams') !== -1) {
                    text = text.replace('Dreams', '<span class="text-gold">Dreams</span>');
                }
                introTitle.innerHTML = text;
            }

            // Description Paragraphs
            if (descContainer && d.introDesc) {
                descContainer.innerHTML = '';
                var paragraphs = d.introDesc.split('\n\n');
                paragraphs.forEach(function (pText) {
                    if (pText.trim()) {
                        var p = document.createElement('p');
                        p.className = 'section-desc';
                        p.textContent = pText.trim();
                        descContainer.appendChild(p);
                    }
                });
            }

            // Company Image
            if (aboutImage && d.aboutImage) {
                aboutImage.src = d.aboutImage;
            }

            // Statistics badge
            if (expYears && d.experienceYears) {
                expYears.textContent = d.experienceYears;
            }
            if (expLabel && d.experienceLabel) {
                // Format label with <br> if it has line breaks or matches default
                var label = d.experienceLabel;
                if (label.indexOf('Years of') !== -1) {
                    label = label.replace('Years of', 'Years of<br>');
                }
                expLabel.innerHTML = label;
            }

            // Mission, Vision, Values
            if (missionText && d.missionText) {
                missionText.textContent = d.missionText;
            }
            if (visionText && d.visionText) {
                visionText.textContent = d.visionText;
            }
            if (valuesText && d.valuesText) {
                valuesText.textContent = d.valuesText;
            }

            // Achievements Section Title
            var achHeadingEl = document.getElementById('aboutAchievementsHeading');
            if (achHeadingEl && d.achievementsHeading) {
                var achHeading = d.achievementsHeading;
                if (achHeading.indexOf('Recognition') !== -1) {
                    achHeading = achHeading.replace('Recognition', '<span class="text-gold">Recognition</span>');
                }
                achHeadingEl.innerHTML = achHeading;
            }

            // Achievements List
            for (var i = 1; i <= 4; i++) {
                var textEl = document.getElementById('aboutAch' + i + 'Text');
                var iconEl = document.getElementById('aboutAch' + i + 'Icon');
                
                if (textEl && d['ach' + i + 'Text']) {
                    textEl.textContent = d['ach' + i + 'Text'];
                }
                if (iconEl && d['ach' + i + 'Icon']) {
                    iconEl.className = 'bi ' + d['ach' + i + 'Icon'];
                }
            }

        } catch (error) {
            console.log('[about.js] Could not load dynamic content, using defaults.');
        }
    });
})();
