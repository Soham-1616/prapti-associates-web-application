/* ═══════════════════════════════════════════
   CONTACT-PAGE.JS — Dynamic Loading for Contact Page
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    var CONTACT_API = 'https://prapti-associates.onrender.com/api/contact-details';

    document.addEventListener('DOMContentLoaded', async function () {
        var addressEl = document.getElementById('contactAddress');
        var primaryPhoneEl = document.getElementById('contactPrimaryPhone');
        var emailContainer = document.getElementById('contactEmailContainer');
        var mapEl = document.getElementById('contactMap');
        
        var fbEl = document.getElementById('contactFacebook');
        var instaEl = document.getElementById('contactInstagram');
        var liEl = document.getElementById('contactLinkedIn');
        var twEl = document.getElementById('contactTwitter');
        var waEl = document.getElementById('contactWhatsapp');

        var weekdayEl = document.getElementById('contactWeekdayHours');
        var saturdayEl = document.getElementById('contactSaturdayHours');
        var sundayEl = document.getElementById('contactSundayHours');

        try {
            var res = await fetch(CONTACT_API);
            var json = await res.json();

            if (!json.success || !json.data) return;

            var d = json.data;

            // Address
            if (addressEl && d.address) {
                // Split address by newlines and format with <br>
                addressEl.innerHTML = d.address.replace(/\n/g, '<br>');
            }

            // Primary Phone Number
            if (primaryPhoneEl && d.primaryPhone) {
                primaryPhoneEl.href = 'tel:' + d.primaryPhone.replace(/\s+/g, '');
                primaryPhoneEl.textContent = d.primaryPhone;
            }

            // Emails
            if (emailContainer && d.primaryEmail) {
                var html = '<a href="mailto:' + d.primaryEmail + '" id="contactPrimaryEmail">' + d.primaryEmail + '</a>';
                if (d.secondaryEmail && d.secondaryEmail.trim()) {
                    html += '<br><a href="mailto:' + d.secondaryEmail + '" id="contactSecondaryEmail">' + d.secondaryEmail + '</a>';
                }
                emailContainer.innerHTML = html;
            }

            // Google Map Source
            if (mapEl && d.googleMapsUrl) {
                mapEl.src = d.googleMapsUrl;
            }

            // Social Media Link mapping
            var socials = [
                { el: fbEl, url: d.facebookUrl },
                { el: instaEl, url: d.instagramUrl },
                { el: liEl, url: d.linkedinUrl },
                { el: twEl, url: d.twitterUrl },
                { el: waEl, url: d.whatsappUrl }
            ];

            socials.forEach(function (social) {
                if (social.el) {
                    if (social.url && social.url !== '#' && social.url.trim() !== '') {
                        social.el.href = social.url;
                        social.el.style.display = ''; // Make sure it's visible
                    } else {
                        social.el.href = '#';
                        // Alternatively hide if client requests, but prompt says "Simply make the existing information editable."
                    }
                }
            });

            // Hours
            if (weekdayEl && d.weekdayHours) weekdayEl.textContent = d.weekdayHours;
            if (saturdayEl && d.saturdayHours) saturdayEl.textContent = d.saturdayHours;
            if (sundayEl && d.sundayHours) sundayEl.textContent = d.sundayHours;

        } catch (error) {
            console.log('[contact-page.js] Could not load dynamic content, using defaults.');
        }
    });
})();
