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
            }
        } catch (error) {
            console.error('[admin-contact] Failed to load contact data:', error);
            showToast('Failed to load existing contact data.', 'danger');
        }
    }

    // ── Save Form Data ──
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Basic validations
        const emailVal = document.getElementById('primaryEmail').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
            showToast('Please enter a valid primary email address.', 'danger');
            return;
        }

        const secEmailVal = document.getElementById('secondaryEmail').value.trim();
        if (secEmailVal && !emailRegex.test(secEmailVal)) {
            showToast('Please enter a valid secondary email address.', 'danger');
            return;
        }

        saveBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';
        saveBtn.disabled = true;

        const payload = {};
        fields.forEach(function (key) {
            const el = document.getElementById(key);
            if (el) {
                payload[key] = el.value.trim();
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
