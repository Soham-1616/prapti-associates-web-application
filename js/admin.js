/* ═══════════════════════════════════════════
   ADMIN.JS — Authentication & Dashboard Core
   Phase 1 Foundation — Auth Guard, Login, Logout, Sidebar
   ═══════════════════════════════════════════ */

const ADMIN_API = 'https://prapti-associates.onrender.com';

// ══════════════════════════════════════
//  AUTH — Token Management
// ══════════════════════════════════════

function getToken() {
    return localStorage.getItem('adminToken');
}

function setToken(token) {
    localStorage.setItem('adminToken', token);
}

function clearToken() {
    localStorage.removeItem('adminToken');
}

function logout() {
    clearToken();
    window.location.href = 'login.html';
}

// ══════════════════════════════════════
//  AUTH GUARD — Protect Admin Pages
// ══════════════════════════════════════

async function checkAuth() {
    const token = getToken();
    if (!token) {
        logout();
        return false;
    }

    try {
        const res = await fetch(ADMIN_API + '/api/auth/verify', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (!data.success) {
            logout();
            return false;
        }
        return true;
    } catch (error) {
        logout();
        return false;
    }
}

// Run auth guard on every admin page EXCEPT login
const currentPath = window.location.pathname;
const isLoginPage = currentPath.endsWith('login.html') || currentPath.endsWith('login');

if (!isLoginPage) {
    checkAuth();
}

// ══════════════════════════════════════
//  LOGIN PAGE — Handle Form Submit
// ══════════════════════════════════════

if (isLoginPage) {
    // If already logged in, redirect to dashboard
    const existingToken = getToken();
    if (existingToken) {
        fetch(ADMIN_API + '/api/auth/verify', {
            headers: { 'Authorization': 'Bearer ' + existingToken }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) window.location.href = 'dashboard.html';
        })
        .catch(() => {});
    }
}

// ══════════════════════════════════════
//  DOM READY — All Interactive Logic
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

    // ── Login Form Handler ──
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            const btn = document.getElementById('loginBtn');

            errorDiv.classList.add('d-none');
            btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Signing in...';
            btn.disabled = true;

            try {
                const res = await fetch(ADMIN_API + '/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    errorDiv.textContent = data.message || 'Invalid credentials.';
                    errorDiv.classList.remove('d-none');
                    btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In';
                    btn.disabled = false;
                    return;
                }

                // Store token and redirect to dashboard
                setToken(data.token);
                window.location.href = 'dashboard.html';

            } catch (error) {
                errorDiv.textContent = 'Could not connect to server. Make sure the backend is running.';
                errorDiv.classList.remove('d-none');
                btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In';
                btn.disabled = false;
            }
        });
    }

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
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });

    // ── Logout Button ──
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

});
