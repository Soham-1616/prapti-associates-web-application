/* ═══════════════════════════════════════════
   PROJECTS.JS — Dynamic Loading + Filter Tabs
   Fetches projects from API, renders cards,
   and applies category filtering.
   ═══════════════════════════════════════════ */

const PROJECTS_API = 'https://prapti-associates.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('projectGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!grid) return;

    // ── Determine image base path ──
    // If opened via file://, use relative paths for images
    // If via localhost, use the API server for images
    const isFilePath = window.location.protocol === 'file:';
    const imgBase = isFilePath ? '' : PROJECTS_API + '/';

    // ── Fetch projects from API ──
    let projects = [];
    try {
        const res = await fetch(PROJECTS_API + '/api/projects');
        const data = await res.json();
        if (data.success) projects = data.data;
    } catch (err) {
        console.error('Failed to fetch projects:', err);
        grid.innerHTML = '<div class="col-12 text-center py-5"><p style="color:#888;"><i class="bi bi-exclamation-triangle me-2"></i>Could not load projects. Please make sure the backend server is running on port 5000.</p></div>';
        return;
    }

    if (projects.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><p style="color:#888;">No projects available yet.</p></div>';
        return;
    }

    // ── Render project cards ──
    function renderCards(projectList) {
        if (projectList.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center py-5"><p style="color:#888;">No projects found in this category.</p></div>';
            return;
        }

        grid.innerHTML = projectList.map((p, i) => {
            const catLabel = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : '';
            const imgSrc = p.heroImage ? imgBase + p.heroImage : 'images/about-construction.png';
            const locationShort = p.location ? p.location.split(',')[0].trim() : '';
            const delay = (i % 3) * 100;

            return `<div class="col-lg-4 col-md-6 project-item" data-category="${p.category}" style="animation: fadeInUp 0.6s ease ${delay}ms both;">
                <div class="project-card-full">
                    <div class="project-card-img">
                        <img src="${imgSrc}" alt="${p.name}" />
                        <div class="project-card-overlay">
                            <a href="project-detail.html?id=${p.id}" class="project-view-btn">
                                <i class="bi bi-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                    <div class="project-card-body">
                        <span class="project-category">${catLabel}</span>
                        <h5 class="project-title">${p.name}</h5>
                        <div class="project-meta">
                            <span><i class="bi bi-geo-alt"></i> ${locationShort}</span>
                            <span><i class="bi bi-calendar3"></i> ${p.year || ''}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // ── Filter Logic ──
    function filterProjects(category) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        if (category === 'all') {
            renderCards(projects);
        } else {
            renderCards(projects.filter(p => p.category === category));
        }
    }

    // ── Button Click ──
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterProjects(btn.getAttribute('data-filter'));
        });
    });

    // ── URL Parameter Filter ──
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        filterProjects(catParam);
    } else {
        renderCards(projects);
    }
});
