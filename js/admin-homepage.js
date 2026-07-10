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
            }
        } catch (error) {
            console.error('[admin-homepage] Failed to load homepage data:', error);
        }
    }

    // ── Save data ──
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        saveBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';
        saveBtn.disabled = true;

        var payload = {};
        fields.forEach(function (key) {
            var el = document.getElementById(key);
            if (el) {
                payload[key] = el.value;
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
