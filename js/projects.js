/* ═══════════════════════════════════════════
   PROJECTS.JS — Filter Tabs & URL Params
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    const grid = document.getElementById('projectGrid');

    if (!filterBtns.length || !projectItems.length) return;

    // ── Filter Logic ──
    function filterProjects(category) {
        // Update active button
        filterBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Filter items
        projectItems.forEach(item => {
            const itemCat = item.getAttribute('data-category');
            if (category === 'all' || itemCat === category) {
                item.classList.remove('hidden');
                item.style.display = '';
            } else {
                item.classList.add('hidden');
                // After transition, fully hide
                setTimeout(() => {
                    if (item.classList.contains('hidden')) {
                        item.style.display = 'none';
                    }
                }, 400);
            }
        });
    }

    // ── Button Click ──
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterProjects(filter);
        });
    });

    // ── URL Parameter Filter ──
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        filterProjects(catParam);
    }
});
