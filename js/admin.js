/* ═══════════════════════════════════════════
   ADMIN.JS — Dashboard Interactivity
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Sidebar Toggle (Mobile) ──
    const sidebar = document.getElementById('adminSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // ── Active Sidebar Link ──
    const currentPage = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage !== href) {
            // Keep first link active for dashboard
        }
    });

    // ── Admin Login Form ──
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Simulate login (replace with actual API call)
            if (email && password) {
                const btn = loginForm.querySelector('button[type="submit"]');
                btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Signing in...';
                btn.disabled = true;

                setTimeout(() => {
                    // Simulate success — redirect to dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
    }

    // ── Action Buttons (Approve/Delete - simulate) ──
    document.querySelectorAll('.btn-outline-success').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            if (row) {
                const badge = row.querySelector('.status-badge');
                if (badge) {
                    badge.className = 'status-badge approved';
                    badge.textContent = 'Approved';
                }
            }
        });
    });

    document.querySelectorAll('.btn-outline-danger').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this item?')) {
                const row = btn.closest('tr');
                if (row) {
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(20px)';
                    row.style.transition = 'all 0.3s ease';
                    setTimeout(() => row.remove(), 300);
                }
            }
        });
    });
});
