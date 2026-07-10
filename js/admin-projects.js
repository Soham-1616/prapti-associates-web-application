/* ═══════════════════════════════════════════
   ADMIN-PROJECTS.JS — Project Management Logic
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    const API = ADMIN_API + '/api/projects';
    const token = getToken();

    const projectsBody = document.getElementById('projectsBody');
    const projectForm = document.getElementById('projectForm');
    const projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    // ── Load & Render Projects ──
    async function loadProjects() {
        try {
            const res = await fetch(API);
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            const projects = data.data;

            if (projects.length === 0) {
                projectsBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox me-2"></i>No projects yet. Click "Add Project" to get started.
                </td></tr>`;
                return;
            }

            projectsBody.innerHTML = projects.map(p => {
                const catLabel = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : '';
                const statusClass = p.status === 'Completed' ? 'approved' : 'pending';
                const thumbSrc = p.heroImage ? ADMIN_API + '/' + p.heroImage : '';
                const thumbHtml = thumbSrc
                    ? `<img src="${thumbSrc}" alt="${p.name}" class="project-thumb" />`
                    : `<div class="project-thumb-placeholder"><i class="bi bi-image"></i></div>`;

                return `<tr>
                    <td>${thumbHtml}</td>
                    <td class="fw-semibold">${p.name}</td>
                    <td><span class="badge bg-light text-dark">${catLabel}</span></td>
                    <td>${p.location || '—'}</td>
                    <td>${p.year || '—'}</td>
                    <td><span class="status-badge ${statusClass}">${p.status || '—'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="editProject(${p.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="deleteProject(${p.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
            }).join('');

        } catch (error) {
            projectsBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>Failed to load projects.
            </td></tr>`;
        }
    }

    // ── Show Toast ──
    function showToast(message, type = 'success') {
        const toast = document.getElementById('adminToast');
        const toastMsg = document.getElementById('toastMessage');
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toastMsg.textContent = message;
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
    }

    // ── Image Previews ──
    document.getElementById('projectHero').addEventListener('change', function () {
        const preview = document.getElementById('heroPreview');
        preview.innerHTML = '';
        if (this.files[0]) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(this.files[0]);
            img.className = 'img-thumb';
            preview.appendChild(img);
        }
    });

    document.getElementById('projectGallery').addEventListener('change', function () {
        const preview = document.getElementById('galleryPreview');
        preview.innerHTML = '';
        Array.from(this.files).forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'img-thumb';
            preview.appendChild(img);
        });
    });

    // ── Add Project Button ──
    document.getElementById('addProjectBtn').addEventListener('click', () => {
        document.getElementById('projectModalLabel').textContent = 'Add New Project';
        projectForm.reset();
        document.getElementById('projectId').value = '';
        document.getElementById('heroPreview').innerHTML = '';
        document.getElementById('galleryPreview').innerHTML = '';
        projectModal.show();
    });

    // ── Edit Project ──
    window.editProject = async function (id) {
        try {
            const res = await fetch(API + '/' + id);
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            const p = data.data;
            document.getElementById('projectModalLabel').textContent = 'Edit Project';
            document.getElementById('projectId').value = p.id;
            document.getElementById('projectName').value = p.name;
            document.getElementById('projectCategory').value = p.category;
            document.getElementById('projectClient').value = p.clientName || '';
            document.getElementById('projectLocation').value = p.location || '';
            document.getElementById('projectYear').value = p.year || '';
            document.getElementById('projectArea').value = p.area || '';
            document.getElementById('projectStatus').value = p.status || 'Ongoing';
            document.getElementById('projectDesc').value = p.description || '';
            document.getElementById('projectDesc2').value = p.description2 || '';

            // Show existing hero image
            const heroPreview = document.getElementById('heroPreview');
            heroPreview.innerHTML = '';
            if (p.heroImage) {
                const img = document.createElement('img');
                img.src = ADMIN_API + '/' + p.heroImage;
                img.className = 'img-thumb';
                heroPreview.appendChild(img);
            }

            // Show existing gallery images
            const galleryPreview = document.getElementById('galleryPreview');
            galleryPreview.innerHTML = '';
            if (p.galleryImages && p.galleryImages.length > 0) {
                p.galleryImages.forEach(imgPath => {
                    const img = document.createElement('img');
                    img.src = ADMIN_API + '/' + imgPath;
                    img.className = 'img-thumb';
                    galleryPreview.appendChild(img);
                });
            }

            // Clear file inputs (user must re-upload to change)
            document.getElementById('projectHero').value = '';
            document.getElementById('projectGallery').value = '';

            projectModal.show();

        } catch (error) {
            showToast('Failed to load project data.', 'danger');
        }
    };

    // ── Delete Project ──
    window.deleteProject = function (id) {
        document.getElementById('deleteProjectId').value = id;
        deleteModal.show();
    };

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        const id = document.getElementById('deleteProjectId').value;
        try {
            const res = await fetch(API + '/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token },
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            deleteModal.hide();
            showToast('Project deleted successfully.');
            loadProjects();

        } catch (error) {
            showToast('Failed to delete project.', 'danger');
        }
    });

    // ── Save Project (Create / Update) ──
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('projectId').value;
        const isEdit = !!id;

        const formData = new FormData();
        formData.append('name', document.getElementById('projectName').value);
        formData.append('category', document.getElementById('projectCategory').value);
        formData.append('clientName', document.getElementById('projectClient').value);
        formData.append('location', document.getElementById('projectLocation').value);
        formData.append('year', document.getElementById('projectYear').value);
        formData.append('area', document.getElementById('projectArea').value);
        formData.append('status', document.getElementById('projectStatus').value);
        formData.append('description', document.getElementById('projectDesc').value);
        formData.append('description2', document.getElementById('projectDesc2').value);

        // Hero image
        const heroFile = document.getElementById('projectHero').files[0];
        if (heroFile) {
            formData.append('heroImage', heroFile);
        }

        // Gallery images
        const galleryFiles = document.getElementById('projectGallery').files;
        for (let i = 0; i < galleryFiles.length; i++) {
            formData.append('galleryImages', galleryFiles[i]);
        }

        const saveBtn = document.getElementById('saveProjectBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';

        try {
            const url = isEdit ? API + '/' + id : API;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData,
            });
            const data = await res.json();

            if (!data.success) throw new Error(data.message);

            projectModal.hide();
            showToast(isEdit ? 'Project updated successfully.' : 'Project created successfully.');
            loadProjects();

        } catch (error) {
            showToast(error.message || 'Failed to save project.', 'danger');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save Project';
        }
    });

    // ── Initial Load ──
    loadProjects();
});
