/* ═══════════════════════════════════════════
   CONNECTIONS.JS — Dynamic Loading + Filter Tabs
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Set this to your backend API URL ──
    const API_BASE = 'http://localhost:5000';
    const grid = document.getElementById('connectionsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loadingEl = document.getElementById('connectionsLoading');

    let allMembers = [];

    // ── Fetch members from API ──
    async function loadMembers() {
        try {
            const res = await fetch(API_BASE + '/api/connections');
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            allMembers = data.data;

            // Remove loading spinner
            if (loadingEl) loadingEl.remove();

            renderMembers(allMembers);

        } catch (error) {
            console.error('Failed to load connections:', error);
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <i class="bi bi-exclamation-triangle text-danger" style="font-size:2rem;"></i>
                    <p class="text-muted mt-2">Unable to load network members.</p>
                `;
            }
        }
    }

    // ── Render member cards ──
    function renderMembers(members) {
        // Clear existing dynamic cards (keep filter buttons container)
        const existingCards = grid.querySelectorAll('.connection-item');
        existingCards.forEach(card => card.remove());

        if (members.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'col-12 text-center py-5 connection-item';
            emptyEl.innerHTML = '<p class="text-muted">No members found in this category.</p>';
            grid.appendChild(emptyEl);
            return;
        }

        members.forEach((m, index) => {
            // Determine badge label
            let badgeLabel = '';
            if (m.category === 'architect') badgeLabel = 'Architect';
            else if (m.category === 'engineer') badgeLabel = 'Engineer';
            else if (m.category === 'coworker') badgeLabel = 'Co-worker';
            else if (m.category === 'custom') badgeLabel = m.customCategory || 'Custom';
            else badgeLabel = m.category;

            // Image source (handle local uploads vs external URLs)
            let photoSrc = m.photo;
            if (photoSrc && !photoSrc.startsWith('http')) {
                photoSrc = API_BASE + '/' + photoSrc;
            }

            // Build contact links — only show if data is available
            let contactHtml = '';
            if (m.phone) contactHtml += `<a href="tel:${m.phone}" title="${m.phone}"><i class="bi bi-telephone"></i></a>`;
            if (m.email) contactHtml += `<a href="mailto:${m.email}" title="${m.email}"><i class="bi bi-envelope"></i></a>`;
            if (m.linkedin) contactHtml += `<a href="${m.linkedin}" target="_blank" title="LinkedIn"><i class="bi bi-linkedin"></i></a>`;

            // For filtering: custom category members also match 'coworker' tab
            const filterCategory = m.category === 'custom' ? 'coworker' : m.category;

            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-6 connection-item';
            col.setAttribute('data-category', filterCategory);
            col.style.animation = `fadeInUp 0.5s ease ${index * 80}ms both`;

            col.innerHTML = `
                <div class="connection-card">
                    <div class="connection-photo-wrapper">
                        <img src="${photoSrc}" alt="${m.name}" class="connection-photo" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random&color=fff&size=200&font-size=0.4&bold=true'" />
                        <span class="connection-badge">${badgeLabel}</span>
                    </div>
                    <div class="connection-info">
                        <h5 class="connection-name">${m.name}</h5>
                        <p class="connection-specialization">${m.designation}</p>
                        ${contactHtml ? `<div class="connection-contact">${contactHtml}</div>` : ''}
                    </div>
                </div>
            `;

            grid.appendChild(col);
        });
    }

    // ── Filter logic ──
    function filterConnections(category) {
        // Update active button
        filterBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Filter items
        const connectionItems = grid.querySelectorAll('.connection-item');
        connectionItems.forEach(item => {
            const itemCat = item.getAttribute('data-category');
            if (category === 'all' || itemCat === category) {
                item.classList.remove('hidden');
                item.style.display = '';
            } else {
                item.classList.add('hidden');
                setTimeout(() => {
                    if (item.classList.contains('hidden')) {
                        item.style.display = 'none';
                    }
                }, 400);
            }
        });
    }

    // Bind filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterConnections(filter);
        });
    });

    // ── Initial Load ──
    loadMembers();
});
