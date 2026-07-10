/* ═══════════════════════════════════════════
   ADMIN MY-ACCOUNT.JS — Admin Account Settings
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const usernameForm = document.getElementById('usernameForm');
    const passwordForm = document.getElementById('passwordForm');

    if (!usernameForm || !passwordForm) return;

    const infoUsername = document.getElementById('infoUsername');
    const currentUsername = document.getElementById('currentUsername');
    const newUsernameInput = document.getElementById('newUsername');
    const topbarUsername = document.getElementById('topbarUsername');

    const updateUsernameBtn = document.getElementById('updateUsernameBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');

    const toastEl = document.getElementById('adminToast');
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    const toastMsg = document.getElementById('toastMessage');

    function showToast(message, type) {
        toastMsg.textContent = message;
        toastEl.className = 'toast align-items-center text-bg-' + (type || 'success') + ' border-0';
        toast.show();
    }

    // ── Load Admin Account Info ──
    async function loadAccountInfo() {
        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/auth/me', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();

            if (data.success && data.data) {
                const u = data.data.username;
                infoUsername.textContent = u;
                currentUsername.value = u;
                if (topbarUsername) {
                    topbarUsername.textContent = u;
                }
            }
        } catch (error) {
            console.error('[admin-my-account] Failed to fetch profile:', error);
            showToast('Failed to load profile settings.', 'danger');
        }
    }

    // ── Update Username Submit ──
    usernameForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const newUsername = newUsernameInput.value.trim();
        if (!newUsername) {
            showToast('Username cannot be empty.', 'danger');
            return;
        }

        updateUsernameBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Updating...';
        updateUsernameBtn.disabled = true;

        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/auth/username', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newUsername })
            });

            const data = await res.json();

            if (data.success) {
                showToast('Username updated successfully!', 'success');
                newUsernameInput.value = '';
                loadAccountInfo(); // Sync UI names
            } else {
                showToast(data.message || 'Failed to update username.', 'danger');
            }
        } catch (error) {
            showToast('Server error. Please try again.', 'danger');
        } finally {
            updateUsernameBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Update Username';
            updateUsernameBtn.disabled = false;
        }
    });

    // ── Change Password Submit ──
    passwordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('All password fields are required.', 'danger');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match.', 'danger');
            return;
        }

        changePasswordBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Updating...';
        changePasswordBtn.disabled = true;

        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (data.success) {
                showToast('Password changed successfully!', 'success');
                passwordForm.reset();
            } else {
                showToast(data.message || 'Failed to change password.', 'danger');
            }
        } catch (error) {
            showToast('Server error. Please try again.', 'danger');
        } finally {
            changePasswordBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Change Password';
            changePasswordBtn.disabled = false;
        }
    });

    // ── Init ──
    loadAccountInfo();
});
