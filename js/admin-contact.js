/* ═══════════════════════════════════════════
   ADMIN CONTACT.JS — Contact Details Editor
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactDetailsForm');
    if (!form) return;

    const saveBtn = document.getElementById('saveContactBtn');
    const toastEl = document.getElementById('adminToast');
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    const toastMsg = document.getElementById('toastMessage');

    const fields = [
        'address',
        'primaryPhone',
        'primaryEmail',
        'secondaryEmail',
        'googleMapsUrl',
        'facebookUrl',
        'instagramUrl',
        'linkedinUrl',
        'twitterUrl',
        'whatsappUrl',
        'weekdayHours',
        'saturdayHours',
        'sundayHours'
    ];

    // ── Validation Helpers ──
    function sanitizeText(str) {
        if (!str) return '';
        return str.trim().replace(/  +/g, ' ');
    }

    function containsMaliciousContent(str) {
        if (!str) return false;
        return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
    }

    function isValidPhone(phone) {
        if (!phone) return false;
        var cleaned = phone.replace(/[\s\-()]/g, '');
        return /^(\+91\d{10}|\d{10})$/.test(cleaned);
    }

    function isValidEmail(email) {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    function isValidGoogleMapsUrl(url) {
        if (!url) return false;
        var u = url.trim();
        return /^https:\/\/(www\.)?google\.com\/maps/.test(u) || /^https:\/\/maps\.google\.com\//.test(u);
    }

    function isValidHttpsUrl(url) {
        if (!url) return false;
        return /^https:\/\/.+/.test(url.trim());
    }

    function isValidWhatsApp(val) {
        if (!val) return false;
        var v = val.trim();
        if (/^https:\/\/wa\.me\//.test(v)) return true;
        if (/^https:\/\/api\.whatsapp\.com\//.test(v)) return true;
        var cleaned = v.replace(/[\s\-()]/g, '');
        if (/^(\+?\d{10,15})$/.test(cleaned)) return true;
        return false;
    }

    function clearValidationErrors() {
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    }

    function showFieldError(fieldId, message) {
        var field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.add('is-invalid');
        var existing = field.parentNode.querySelector('.invalid-feedback');
        if (existing) existing.remove();
        var feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        feedback.style.display = 'block';
        field.parentNode.appendChild(feedback);
    }

    function validateContactForm() {
        clearValidationErrors();
        var errors = [];

        // Address
        var addr = sanitizeText(document.getElementById('address').value);
        if (!addr) errors.push({ field: 'address', msg: 'Office Address is required.' });
        else if (addr.length < 15) errors.push({ field: 'address', msg: 'Office Address must be at least 15 characters.' });
        else if (addr.length > 300) errors.push({ field: 'address', msg: 'Office Address cannot exceed 300 characters.' });
        else if (containsMaliciousContent(addr)) errors.push({ field: 'address', msg: 'HTML or script tags are not allowed.' });

        // Primary Phone
        var phone = sanitizeText(document.getElementById('primaryPhone').value);
        if (!phone) errors.push({ field: 'primaryPhone', msg: 'Primary Phone Number is required.' });
        else if (!isValidPhone(phone)) errors.push({ field: 'primaryPhone', msg: 'Please enter a valid phone number.' });

        // Primary Email
        var email = sanitizeText(document.getElementById('primaryEmail').value);
        if (!email) errors.push({ field: 'primaryEmail', msg: 'Primary Email Address is required.' });
        else if (!isValidEmail(email)) errors.push({ field: 'primaryEmail', msg: 'Please enter a valid email address.' });

        // Secondary Email (optional)
        var secEmail = sanitizeText(document.getElementById('secondaryEmail').value);
        if (secEmail) {
            if (!isValidEmail(secEmail)) errors.push({ field: 'secondaryEmail', msg: 'Please enter a valid secondary email address.' });
        }

        // Google Maps URL
        var maps = sanitizeText(document.getElementById('googleMapsUrl').value);
        if (!maps) errors.push({ field: 'googleMapsUrl', msg: 'Google Maps Embed URL is required.' });
        else if (!isValidGoogleMapsUrl(maps)) errors.push({ field: 'googleMapsUrl', msg: 'Please enter a valid Google Maps Embed URL.' });

        // Social Media (optional)
        [['facebookUrl','Facebook'],['instagramUrl','Instagram'],['linkedinUrl','LinkedIn'],['twitterUrl','Twitter/X']].forEach(function([id, label]) {
            var v = sanitizeText(document.getElementById(id).value);
            if (v && v !== '#') {
                if (!isValidHttpsUrl(v)) errors.push({ field: id, msg: label + ' URL must be a valid HTTPS link.' });
                else if (containsMaliciousContent(v)) errors.push({ field: id, msg: 'HTML or script tags are not allowed.' });
            }
        });

        // WhatsApp (optional)
        var wa = sanitizeText(document.getElementById('whatsappUrl').value);
        if (wa && wa !== '#') {
            if (!isValidWhatsApp(wa)) errors.push({ field: 'whatsappUrl', msg: 'Please enter a valid WhatsApp URL or phone number.' });
        }

        // Office Hours
        [['weekdayHours','Monday-Friday Hours'],['saturdayHours','Saturday Hours'],['sundayHours','Sunday Hours']].forEach(function([id, label]) {
            var v = sanitizeText(document.getElementById(id).value);
            if (!v) errors.push({ field: id, msg: label + ' is required.' });
            else if (v.length < 3) errors.push({ field: id, msg: label + ' must be at least 3 characters.' });
            else if (v.length > 50) errors.push({ field: id, msg: label + ' cannot exceed 50 characters.' });
            else if (containsMaliciousContent(v)) errors.push({ field: id, msg: 'HTML or script tags are not allowed.' });
        });

        // Display errors
        errors.forEach(function(err) { showFieldError(err.field, err.msg); });
        if (errors.length > 0) {
            var firstField = document.getElementById(errors[0].field);
            if (firstField) firstField.focus();
        }
        return errors.length === 0;
    }

    function showToast(message, type) {
        toastMsg.textContent = message;
        toastEl.className = 'toast align-items-center text-bg-' + (type || 'success') + ' border-0';
        toast.show();
    }

    // ── Load Existing Data ──
    async function loadContactData() {
        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/contact-details', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();

            if (data.success && data.data) {
                const d = data.data;
                fields.forEach(function (key) {
                    const el = document.getElementById(key);
                    if (el && d[key] !== undefined) {
                        el.value = d[key];
                    }
                });
                clearValidationErrors();
            }
        } catch (error) {
            console.error('[admin-contact] Failed to load contact data:', error);
            showToast('Failed to load existing contact data.', 'danger');
        }
    }

    // ── Save Form Data ──
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate before submission
        if (!validateContactForm()) {
            return;
        }

        saveBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';
        saveBtn.disabled = true;

        // Build sanitized payload
        var payload = {};
        fields.forEach(function (key) {
            var el = document.getElementById(key);
            if (el) {
                payload[key] = sanitizeText(el.value);
            }
        });

        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/contact-details', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                showToast('Contact details updated successfully!', 'success');
                clearValidationErrors();
            } else {
                showToast(data.message || 'Failed to save contact details.', 'danger');
            }
        } catch (error) {
            showToast('Server error. Please try again.', 'danger');
        } finally {
            saveBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save Contact Info';
            saveBtn.disabled = false;
        }
    });

    // ── Init ──
    loadContactData();
});
