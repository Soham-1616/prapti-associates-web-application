/* ═══════════════════════════════════════════
   ADMIN-PROJECTS.JS — Project Management Logic
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Validation Helpers ──
    function sanitizeText(str) {
        if (!str) return '';
        return str.trim().replace(/\s+/g, ' ');
    }

    function containsMaliciousContent(str) {
        if (!str) return false;
        return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
    }

    function extractAreaNumber(str) {
        if (!str) return null;
        const match = str.toString().trim().match(/^([\d,]+\.?\d*)/);
        if (!match) return null;
        const num = parseFloat(match[1].replace(/,/g, ''));
        return (num > 0) ? num : null;
    }

    function clearValidationErrors() {
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    }

    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.add('is-invalid');
        const existing = field.parentNode.querySelector('.invalid-feedback');
        if (existing) existing.remove();
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        feedback.style.display = 'block';
        field.parentNode.appendChild(feedback);
    }

    function validateProjectForm() {
        clearValidationErrors();
        const errors = [];
        const currentYear = new Date().getFullYear();

        // Project Name
        const name = sanitizeText(document.getElementById('projectName').value);
        if (!name) errors.push({ field: 'projectName', msg: 'Project Name is required.' });
        else if (name.length < 3) errors.push({ field: 'projectName', msg: 'Project Name must be at least 3 characters.' });
        else if (name.length > 100) errors.push({ field: 'projectName', msg: 'Project Name cannot exceed 100 characters.' });
        else if (!/^[a-zA-Z0-9\s\-&.,]+$/.test(name)) errors.push({ field: 'projectName', msg: 'Project Name contains invalid characters.' });
        else if (containsMaliciousContent(document.getElementById('projectName').value)) errors.push({ field: 'projectName', msg: 'HTML or script tags are not allowed.' });

        // Category
        const category = document.getElementById('projectCategory').value;
        if (!category || !['residential', 'commercial', 'institutional', 'industrial'].includes(category)) {
            errors.push({ field: 'projectCategory', msg: 'Please select a valid category.' });
        }

        // Client Name (optional)
        const clientName = sanitizeText(document.getElementById('projectClient').value);
        if (clientName) {
            if (clientName.length < 3) errors.push({ field: 'projectClient', msg: 'Client Name must be at least 3 characters.' });
            else if (clientName.length > 100) errors.push({ field: 'projectClient', msg: 'Client Name cannot exceed 100 characters.' });
            else if (containsMaliciousContent(document.getElementById('projectClient').value)) errors.push({ field: 'projectClient', msg: 'HTML or script tags are not allowed.' });
        }

        // Location
        const location = sanitizeText(document.getElementById('projectLocation').value);
        if (!location) errors.push({ field: 'projectLocation', msg: 'Location is required.' });
        else if (location.length > 100) errors.push({ field: 'projectLocation', msg: 'Location cannot exceed 100 characters.' });
        else if (containsMaliciousContent(document.getElementById('projectLocation').value)) errors.push({ field: 'projectLocation', msg: 'HTML or script tags are not allowed.' });

        // Year
        const year = sanitizeText(document.getElementById('projectYear').value);
        if (!year) errors.push({ field: 'projectYear', msg: 'Year is required.' });
        else if (!/^\d{4}$/.test(year)) errors.push({ field: 'projectYear', msg: 'Year must be a valid 4-digit number.' });
        else {
            const yNum = parseInt(year);
            if (yNum < 1900 || yNum > currentYear + 5) errors.push({ field: 'projectYear', msg: 'Year must be between 1900 and ' + (currentYear + 5) + '.' });
        }

        // Area
        const area = sanitizeText(document.getElementById('projectArea').value);
        if (!area) errors.push({ field: 'projectArea', msg: 'Area is required.' });
        else if (!extractAreaNumber(area)) errors.push({ field: 'projectArea', msg: 'Area must be a positive number (e.g., 3200 or 3200 sq.ft).' });
        else if (containsMaliciousContent(document.getElementById('projectArea').value)) errors.push({ field: 'projectArea', msg: 'HTML or script tags are not allowed.' });

        // Description
        const desc = sanitizeText(document.getElementById('projectDesc').value);
        if (!desc) errors.push({ field: 'projectDesc', msg: 'Description is required.' });
        else if (desc.length < 30) errors.push({ field: 'projectDesc', msg: 'Description must be at least 30 characters.' });
        else if (desc.length > 3000) errors.push({ field: 'projectDesc', msg: 'Description cannot exceed 3000 characters.' });
        else if (containsMaliciousContent(document.getElementById('projectDesc').value)) errors.push({ field: 'projectDesc', msg: 'HTML or script tags are not allowed.' });

        // Additional Description (optional)
        const desc2 = sanitizeText(document.getElementById('projectDesc2').value);
        if (desc2) {
            if (desc2.length < 30) errors.push({ field: 'projectDesc2', msg: 'Additional Description must be at least 30 characters.' });
            else if (desc2.length > 3000) errors.push({ field: 'projectDesc2', msg: 'Additional Description cannot exceed 3000 characters.' });
            else if (containsMaliciousContent(document.getElementById('projectDesc2').value)) errors.push({ field: 'projectDesc2', msg: 'HTML or script tags are not allowed.' });
        }

        // Show errors
        errors.forEach(err => showFieldError(err.field, err.msg));
        if (errors.length > 0) {
            const firstField = document.getElementById(errors[0].field);
            if (firstField) firstField.focus();
        }
        return errors.length === 0;
    }

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
        clearValidationErrors();
        projectModal.show();
    });

    // ── Edit Project ──
    window.editProject = async function (id) {
        try {
            clearValidationErrors();
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

        // Validate form before submission
        if (!validateProjectForm()) {
            return;
        }

        const id = document.getElementById('projectId').value;
        const isEdit = !!id;

        const formData = new FormData();
        formData.append('name', sanitizeText(document.getElementById('projectName').value));
        formData.append('category', document.getElementById('projectCategory').value);
        formData.append('clientName', sanitizeText(document.getElementById('projectClient').value));
        formData.append('location', sanitizeText(document.getElementById('projectLocation').value));
        formData.append('year', sanitizeText(document.getElementById('projectYear').value));
        formData.append('area', sanitizeText(document.getElementById('projectArea').value));
        formData.append('status', document.getElementById('projectStatus').value);
        formData.append('description', sanitizeText(document.getElementById('projectDesc').value));
        formData.append('description2', sanitizeText(document.getElementById('projectDesc2').value));

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
