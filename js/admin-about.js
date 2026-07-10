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

    function showToast(message, type) {
        toastMsg.textContent = message;
        toastEl.className = 'toast align-items-center text-bg-' + (type || 'success') + ' border-0';
        toast.show();
    }

    // ── Update Image Preview ──
    imageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            // Validate size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds the 5MB limit.');
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
            }
        } catch (error) {
            console.error('[admin-about] Failed to load about page data:', error);
            showToast('Failed to load existing About page data.', 'danger');
        }
    }

    // ── Save Form Data ──
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        saveBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';
        saveBtn.disabled = true;

        const formData = new FormData();
        
        // Append text fields
        textFields.forEach(function (key) {
            const el = document.getElementById(key);
            if (el) {
                formData.append(key, el.value);
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
