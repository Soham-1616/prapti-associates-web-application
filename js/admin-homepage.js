/* ═══════════════════════════════════════════
   ADMIN HOMEPAGE.JS — Homepage Content Editor
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('homepageForm');
    if (!form) return;

    const saveBtn = document.getElementById('saveHomepageBtn');
    const toastEl = document.getElementById('adminToast');
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    const toastMsg = document.getElementById('toastMessage');

    // Field IDs matching the JSON keys
    const fields = [
        'heroBadge',
        'heroHeadingLine1',
        'heroHeadingLine2',
        'heroDescription',
        'primaryBtnText',
        'primaryBtnLink',
        'secondaryBtnText',
        'secondaryBtnLink',
        'stat1Number',
        'stat1Label',
        'stat2Number',
        'stat2Label',
        'stat3Number',
        'stat3Label'
    ];

    // ── Validation Helpers ──
    function sanitizeText(str) {
        if (!str) return '';
        return str.trim().replace(/\s+/g, ' ');
    }

    function containsMaliciousContent(str) {
        if (!str) return false;
        return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
    }

    function isValidLink(link) {
        if (!link) return false;
        if (/^[a-zA-Z0-9_.\-/#?=&%]+$/.test(link)) return true;
        if (/^https:\/\/.+/.test(link)) return true;
        return false;
    }

    function isValidStatNumber(val) {
        if (!val) return false;
        return /^\d+[+%]?$/.test(val.trim());
    }

    function clearValidationErrors() {
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    }

    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.add('is-invalid');
        const existing = field.parentNode.querySelector('.invalid-feedback');
        if (existing) existing.remove();
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        feedback.style.display = 'block';
        field.parentNode.appendChild(feedback);
    }

    function validateHomepageForm() {
        clearValidationErrors();
        const errors = [];

        // Badge (optional)
        const badge = sanitizeText(document.getElementById('heroBadge').value);
        if (badge) {
            if (badge.length < 3) errors.push({ field: 'heroBadge', msg: 'Badge Text must be at least 3 characters.' });
            else if (badge.length > 50) errors.push({ field: 'heroBadge', msg: 'Badge Text cannot exceed 50 characters.' });
            else if (containsMaliciousContent(badge)) errors.push({ field: 'heroBadge', msg: 'HTML or script tags are not allowed.' });
        }

        // Heading Line 1
        const h1 = sanitizeText(document.getElementById('heroHeadingLine1').value);
        if (!h1) errors.push({ field: 'heroHeadingLine1', msg: 'Heading Line 1 is required.' });
        else if (h1.length < 5) errors.push({ field: 'heroHeadingLine1', msg: 'Heading Line 1 must be at least 5 characters.' });
        else if (h1.length > 80) errors.push({ field: 'heroHeadingLine1', msg: 'Heading Line 1 cannot exceed 80 characters.' });
        else if (containsMaliciousContent(h1)) errors.push({ field: 'heroHeadingLine1', msg: 'HTML or script tags are not allowed.' });

        // Heading Line 2
        const h2 = sanitizeText(document.getElementById('heroHeadingLine2').value);
        if (!h2) errors.push({ field: 'heroHeadingLine2', msg: 'Heading Line 2 is required.' });
        else if (h2.length < 5) errors.push({ field: 'heroHeadingLine2', msg: 'Heading Line 2 must be at least 5 characters.' });
        else if (h2.length > 80) errors.push({ field: 'heroHeadingLine2', msg: 'Heading Line 2 cannot exceed 80 characters.' });
        else if (containsMaliciousContent(h2)) errors.push({ field: 'heroHeadingLine2', msg: 'HTML or script tags are not allowed.' });

        // Description
        const desc = sanitizeText(document.getElementById('heroDescription').value);
        if (!desc) errors.push({ field: 'heroDescription', msg: 'Description is required.' });
        else if (desc.length < 30) errors.push({ field: 'heroDescription', msg: 'Description must be at least 30 characters.' });
        else if (desc.length > 500) errors.push({ field: 'heroDescription', msg: 'Description cannot exceed 500 characters.' });
        else if (containsMaliciousContent(desc)) errors.push({ field: 'heroDescription', msg: 'HTML or script tags are not allowed.' });

        // Primary Button Text
        const pbt = sanitizeText(document.getElementById('primaryBtnText').value);
        if (!pbt) errors.push({ field: 'primaryBtnText', msg: 'Primary Button Text is required.' });
        else if (pbt.length < 2) errors.push({ field: 'primaryBtnText', msg: 'Primary Button Text must be at least 2 characters.' });
        else if (pbt.length > 30) errors.push({ field: 'primaryBtnText', msg: 'Primary Button Text cannot exceed 30 characters.' });
        else if (containsMaliciousContent(pbt)) errors.push({ field: 'primaryBtnText', msg: 'HTML or script tags are not allowed.' });

        // Primary Button Link
        const pbl = sanitizeText(document.getElementById('primaryBtnLink').value);
        if (!pbl) errors.push({ field: 'primaryBtnLink', msg: 'Primary Button Link is required.' });
        else if (!isValidLink(pbl)) errors.push({ field: 'primaryBtnLink', msg: 'Please enter a valid page link.' });

        // Secondary Button Text
        const sbt = sanitizeText(document.getElementById('secondaryBtnText').value);
        if (!sbt) errors.push({ field: 'secondaryBtnText', msg: 'Secondary Button Text is required.' });
        else if (sbt.length < 2) errors.push({ field: 'secondaryBtnText', msg: 'Secondary Button Text must be at least 2 characters.' });
        else if (sbt.length > 30) errors.push({ field: 'secondaryBtnText', msg: 'Secondary Button Text cannot exceed 30 characters.' });
        else if (containsMaliciousContent(sbt)) errors.push({ field: 'secondaryBtnText', msg: 'HTML or script tags are not allowed.' });

        // Secondary Button Link
        const sbl = sanitizeText(document.getElementById('secondaryBtnLink').value);
        if (!sbl) errors.push({ field: 'secondaryBtnLink', msg: 'Secondary Button Link is required.' });
        else if (!isValidLink(sbl)) errors.push({ field: 'secondaryBtnLink', msg: 'Please enter a valid page link.' });

        // Statistics Numbers
        [['stat1Number','Stat 1 Number'],['stat2Number','Stat 2 Number'],['stat3Number','Stat 3 Number']].forEach(([id, label]) => {
            const v = sanitizeText(document.getElementById(id).value);
            if (!v) errors.push({ field: id, msg: label + ' is required.' });
            else if (!isValidStatNumber(v)) errors.push({ field: id, msg: label + ' must be a positive number (e.g. 50, 98%, 12+).' });
        });

        // Statistics Labels
        [['stat1Label','Stat 1 Label'],['stat2Label','Stat 2 Label'],['stat3Label','Stat 3 Label']].forEach(([id, label]) => {
            const v = sanitizeText(document.getElementById(id).value);
            if (!v) errors.push({ field: id, msg: label + ' is required.' });
            else if (v.length < 3) errors.push({ field: id, msg: label + ' must be at least 3 characters.' });
            else if (v.length > 40) errors.push({ field: id, msg: label + ' cannot exceed 40 characters.' });
            else if (containsMaliciousContent(v)) errors.push({ field: id, msg: 'HTML or script tags are not allowed in ' + label + '.' });
        });

        // Display all errors
        errors.forEach(err => showFieldError(err.field, err.msg));
        if (errors.length > 0) {
            const firstField = document.getElementById(errors[0].field);
            if (firstField) firstField.focus();
        }
        return errors.length === 0;
    }

    function showToast(message, type) {
        toastMsg.textContent = message;
        toastEl.className = 'toast align-items-center text-bg-' + (type || 'success') + ' border-0';
        toast.show();
    }

    // ── Load existing data ──
    async function loadHomepageData() {
        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/homepage', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();

            if (data.success && data.data) {
                fields.forEach(function (key) {
                    var el = document.getElementById(key);
                    if (el && data.data[key] !== undefined) {
                        el.value = data.data[key];
                    }
                });
                clearValidationErrors();
            }
        } catch (error) {
            console.error('[admin-homepage] Failed to load homepage data:', error);
        }
    }

    // ── Save data ──
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate before submission
        if (!validateHomepageForm()) {
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
            const res = await fetch(ADMIN_API + '/api/homepage', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                showToast('Homepage updated successfully!', 'success');
                clearValidationErrors();
            } else {
                showToast(data.message || 'Failed to save.', 'danger');
            }
        } catch (error) {
            showToast('Server error. Please try again.', 'danger');
        } finally {
            saveBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save Changes';
            saveBtn.disabled = false;
        }
    });

    // ── Init ──
    loadHomepageData();
});
