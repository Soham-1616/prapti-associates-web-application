/* ═══════════════════════════════════════════
   ADMIN ABOUT.JS — About Page Content Editor
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('aboutForm');
    if (!form) return;

    const saveBtn = document.getElementById('saveAboutBtn');
    const imageInput = document.getElementById('aboutImage');
    const imagePreview = document.getElementById('aboutImagePreview');

    const toastEl = document.getElementById('adminToast');
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    const toastMsg = document.getElementById('toastMessage');

    const textFields = [
        'introTitle',
        'introDesc',
        'experienceYears',
        'experienceLabel',
        'missionText',
        'visionText',
        'valuesText',
        'achievementsHeading',
        'ach1Text',
        'ach1Icon',
        'ach2Text',
        'ach2Icon',
        'ach3Text',
        'ach3Icon',
        'ach4Text',
        'ach4Icon'
    ];

    // ── Validation Helpers ──
    function sanitizeText(str) {
        if (!str) return '';
        return str.trim().replace(/  +/g, ' ');
    }

    function sanitizeMultiline(str) {
        if (!str) return '';
        return str.trim().replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n');
    }

    function containsMaliciousContent(str) {
        if (!str) return false;
        return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
    }

    function isValidExperienceYears(val) {
        if (!val) return false;
        return /^[1-9]\d?[+]?$/.test(val.trim());
    }

    function isValidBootstrapIcon(val) {
        if (!val) return false;
        return /^bi-[a-z0-9-]+$/.test(val.trim());
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

    function validateAboutForm() {
        clearValidationErrors();
        const errors = [];

        // Introduction Title
        const title = sanitizeText(document.getElementById('introTitle').value);
        if (!title) errors.push({ field: 'introTitle', msg: 'Introduction Title is required.' });
        else if (title.length < 5) errors.push({ field: 'introTitle', msg: 'Introduction Title must be at least 5 characters.' });
        else if (title.length > 100) errors.push({ field: 'introTitle', msg: 'Introduction Title cannot exceed 100 characters.' });
        else if (containsMaliciousContent(title)) errors.push({ field: 'introTitle', msg: 'HTML or script tags are not allowed.' });

        // Company Description
        const desc = sanitizeMultiline(document.getElementById('introDesc').value);
        if (!desc) errors.push({ field: 'introDesc', msg: 'Company Description is required.' });
        else if (desc.length < 100) errors.push({ field: 'introDesc', msg: 'Company Description must be at least 100 characters.' });
        else if (desc.length > 3000) errors.push({ field: 'introDesc', msg: 'Company Description cannot exceed 3000 characters.' });
        else if (containsMaliciousContent(desc)) errors.push({ field: 'introDesc', msg: 'HTML or script tags are not allowed.' });

        // Experience Years
        const ey = sanitizeText(document.getElementById('experienceYears').value);
        if (!ey) errors.push({ field: 'experienceYears', msg: 'Experience Years is required.' });
        else if (!isValidExperienceYears(ey)) errors.push({ field: 'experienceYears', msg: 'Please enter a valid experience value (e.g. 12, 25+).' });

        // Experience Label
        const el = sanitizeText(document.getElementById('experienceLabel').value);
        if (!el) errors.push({ field: 'experienceLabel', msg: 'Experience Label is required.' });
        else if (el.length < 3) errors.push({ field: 'experienceLabel', msg: 'Experience Label must be at least 3 characters.' });
        else if (el.length > 40) errors.push({ field: 'experienceLabel', msg: 'Experience Label cannot exceed 40 characters.' });
        else if (containsMaliciousContent(el)) errors.push({ field: 'experienceLabel', msg: 'HTML or script tags are not allowed.' });

        // Company Photo (optional, only validate if selected)
        const file = imageInput.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
                errors.push({ field: 'aboutImage', msg: 'Only JPG, JPEG, PNG and WEBP images are allowed.' });
            }
            if (file.size > 5 * 1024 * 1024) {
                errors.push({ field: 'aboutImage', msg: 'Image file size cannot exceed 5MB.' });
            }
        }

        // Mission
        const mission = sanitizeMultiline(document.getElementById('missionText').value);
        if (!mission) errors.push({ field: 'missionText', msg: 'Mission Text is required.' });
        else if (mission.length < 20) errors.push({ field: 'missionText', msg: 'Mission Text must be at least 20 characters.' });
        else if (mission.length > 500) errors.push({ field: 'missionText', msg: 'Mission Text cannot exceed 500 characters.' });
        else if (containsMaliciousContent(mission)) errors.push({ field: 'missionText', msg: 'HTML or script tags are not allowed.' });

        // Vision
        const vision = sanitizeMultiline(document.getElementById('visionText').value);
        if (!vision) errors.push({ field: 'visionText', msg: 'Vision Text is required.' });
        else if (vision.length < 20) errors.push({ field: 'visionText', msg: 'Vision Text must be at least 20 characters.' });
        else if (vision.length > 500) errors.push({ field: 'visionText', msg: 'Vision Text cannot exceed 500 characters.' });
        else if (containsMaliciousContent(vision)) errors.push({ field: 'visionText', msg: 'HTML or script tags are not allowed.' });

        // Values
        const values = sanitizeMultiline(document.getElementById('valuesText').value);
        if (!values) errors.push({ field: 'valuesText', msg: 'Values Text is required.' });
        else if (values.length < 20) errors.push({ field: 'valuesText', msg: 'Values Text must be at least 20 characters.' });
        else if (values.length > 800) errors.push({ field: 'valuesText', msg: 'Values Text cannot exceed 800 characters.' });
        else if (containsMaliciousContent(values)) errors.push({ field: 'valuesText', msg: 'HTML or script tags are not allowed.' });

        // Achievements Heading (optional)
        const ah = sanitizeText(document.getElementById('achievementsHeading').value);
        if (ah) {
            if (ah.length > 80) errors.push({ field: 'achievementsHeading', msg: 'Achievements Heading cannot exceed 80 characters.' });
            else if (containsMaliciousContent(ah)) errors.push({ field: 'achievementsHeading', msg: 'HTML or script tags are not allowed.' });
        }

        // Achievement Texts (1-4)
        [['ach1Text','Achievement 1 Text'],['ach2Text','Achievement 2 Text'],['ach3Text','Achievement 3 Text'],['ach4Text','Achievement 4 Text']].forEach(([id, label]) => {
            const v = sanitizeText(document.getElementById(id).value);
            if (!v) errors.push({ field: id, msg: label + ' is required.' });
            else if (v.length < 3) errors.push({ field: id, msg: label + ' must be at least 3 characters.' });
            else if (v.length > 60) errors.push({ field: id, msg: label + ' cannot exceed 60 characters.' });
            else if (containsMaliciousContent(v)) errors.push({ field: id, msg: 'HTML or script tags are not allowed in ' + label + '.' });
        });

        // Achievement Icons (1-4)
        [['ach1Icon','Achievement 1 Icon'],['ach2Icon','Achievement 2 Icon'],['ach3Icon','Achievement 3 Icon'],['ach4Icon','Achievement 4 Icon']].forEach(([id, label]) => {
            const v = sanitizeText(document.getElementById(id).value);
            if (!v) errors.push({ field: id, msg: label + ' is required.' });
            else if (!isValidBootstrapIcon(v)) errors.push({ field: id, msg: 'Please enter a valid Bootstrap Icon class (e.g. bi-award-fill).' });
        });

        // Display errors
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

    // ── Update Image Preview ──
    imageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            // Validate type
            const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedExts.includes(ext)) {
                showToast('Only JPG, JPEG, PNG and WEBP images are allowed.', 'danger');
                this.value = '';
                return;
            }
            // Validate size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size exceeds the 5MB limit.', 'danger');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // ── Load Existing Data ──
    async function loadAboutData() {
        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/about', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();

            if (data.success && data.data) {
                const d = data.data;

                // Populate text fields
                textFields.forEach(function (key) {
                    const el = document.getElementById(key);
                    if (el && d[key] !== undefined) {
                        el.value = d[key];
                    }
                });

                // Update image preview
                if (d.aboutImage) {
                    imagePreview.src = d.aboutImage.startsWith('http') ? d.aboutImage : '../' + d.aboutImage;
                }
                clearValidationErrors();
            }
        } catch (error) {
            console.error('[admin-about] Failed to load about page data:', error);
            showToast('Failed to load existing About page data.', 'danger');
        }
    }

    // ── Save Form Data ──
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate before submission
        if (!validateAboutForm()) {
            return;
        }

        saveBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';
        saveBtn.disabled = true;

        const formData = new FormData();
        
        // Append sanitized text fields
        textFields.forEach(function (key) {
            const el = document.getElementById(key);
            if (el) {
                const isMultiline = ['introDesc', 'missionText', 'visionText', 'valuesText'].includes(key);
                formData.append(key, isMultiline ? sanitizeMultiline(el.value) : sanitizeText(el.value));
            }
        });

        // Append file if selected
        if (imageInput.files[0]) {
            formData.append('aboutImage', imageInput.files[0]);
        }

        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/about', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token
                    // Fetch sets multipart/form-data Content-Type boundary automatically for FormData
                },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                showToast('About page updated successfully!', 'success');
                clearValidationErrors();
                // Reload to sync image paths
                loadAboutData();
                imageInput.value = ''; // Reset file input
            } else {
                showToast(data.message || 'Failed to save About page content.', 'danger');
            }
        } catch (error) {
            showToast('Server error. Please try again.', 'danger');
        } finally {
            saveBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save About Us';
            saveBtn.disabled = false;
        }
    });

    // ── Init ──
    loadAboutData();
});
