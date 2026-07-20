/* ═══════════════════════════════════════════
   ADMIN SERVICES.JS — CMS Logic
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

    function validateServiceForm() {
        clearValidationErrors();
        const errors = [];

        // Service Name
        const name = sanitizeText(document.getElementById('serviceName').value);
        if (!name) errors.push({ field: 'serviceName', msg: 'Service Name is required.' });
        else if (name.length < 3) errors.push({ field: 'serviceName', msg: 'Service Name must be at least 3 characters.' });
        else if (name.length > 100) errors.push({ field: 'serviceName', msg: 'Service Name cannot exceed 100 characters.' });
        else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(name)) errors.push({ field: 'serviceName', msg: 'Service Name contains invalid characters.' });
        else if (containsMaliciousContent(document.getElementById('serviceName').value)) errors.push({ field: 'serviceName', msg: 'HTML or script tags are not allowed.' });

        // Description
        const desc = sanitizeText(document.getElementById('serviceDescription').value);
        if (!desc) errors.push({ field: 'serviceDescription', msg: 'Description is required.' });
        else if (desc.length < 20) errors.push({ field: 'serviceDescription', msg: 'Description must be at least 20 characters.' });
        else if (desc.length > 500) errors.push({ field: 'serviceDescription', msg: 'Description cannot exceed 500 characters.' });
        else if (containsMaliciousContent(document.getElementById('serviceDescription').value)) errors.push({ field: 'serviceDescription', msg: 'HTML or script tags are not allowed.' });

        // Icon Class
        let iconVal = sanitizeText(document.getElementById('serviceIcon').value);
        if (!iconVal.startsWith('bi-') && iconVal.length > 0) iconVal = 'bi-' + iconVal;
        if (!iconVal) errors.push({ field: 'serviceIcon', msg: 'Icon class is required.' });
        else if (!/^bi-[a-z0-9-]+$/.test(iconVal)) errors.push({ field: 'serviceIcon', msg: 'Please enter a valid Bootstrap Icon class (e.g., bi-tools, bi-building).' });

        // Display Order
        const orderVal = document.getElementById('serviceOrder').value;
        const orderNum = parseInt(orderVal);
        if (!orderVal) errors.push({ field: 'serviceOrder', msg: 'Display Order is required.' });
        else if (isNaN(orderNum) || !Number.isInteger(orderNum)) errors.push({ field: 'serviceOrder', msg: 'Display Order must be a positive number.' });
        else if (orderNum < 1 || orderNum > 999) errors.push({ field: 'serviceOrder', msg: 'Display Order must be between 1 and 999.' });

        // Status
        const status = document.getElementById('serviceStatus').value;
        if (!status || !['active', 'inactive'].includes(status)) {
            errors.push({ field: 'serviceStatus', msg: 'Please select a valid status.' });
        }

        // Show errors
        errors.forEach(err => showFieldError(err.field, err.msg));
        if (errors.length > 0) {
            const firstField = document.getElementById(errors[0].field);
            if (firstField) firstField.focus();
        }
        return errors.length === 0;
    }

    // ── Variables & Elements ──
    const tbody = document.getElementById('servicesBody');
    const searchInput = document.getElementById('searchService');
    const filterStatus = document.getElementById('filterStatus');
    const addBtn = document.getElementById('addServiceBtn');

    // Modal elements
    const serviceModal = new bootstrap.Modal(document.getElementById('serviceModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const serviceForm = document.getElementById('serviceForm');
    const modalTitle = document.getElementById('serviceModalLabel');
    const iconInput = document.getElementById('serviceIcon');
    const iconPreviewElement = document.getElementById('iconPreviewElement');

    // Toast element
    const toastEl = document.getElementById('adminToast');
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    const toastMsg = document.getElementById('toastMessage');

    let allServices = [];

    function showToast(message, type = 'success') {
        toastMsg.textContent = message;
        toastEl.className = `toast align-items-center text-bg-${type} border-0`;
        toast.show();
    }

    // ── Fetch Services ──
    async function loadServices() {
        try {
            const token = getToken();
            const res = await fetch(ADMIN_API + '/api/services', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            
            if (data.success) {
                allServices = data.data;
                renderServices(allServices);
            } else {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${data.message}</td></tr>`;
            }
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to connect to server.</td></tr>`;
        }
    }

    // ── Render Services ──
    function renderServices(services) {
        if (services.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No services found.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        services.forEach(s => {
            const badgeClass = s.status === 'active' ? 'status-badge approved' : 'status-badge pending';
            const badgeText = s.status === 'active' ? 'Active' : 'Inactive';
            const iconClass = s.icon || 'bi-tools';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge bg-secondary">${s.displayOrder}</span></td>
                <td>
                    <div class="service-icon-preview">
                        <i class="bi ${iconClass}"></i>
                    </div>
                </td>
                <td class="fw-semibold">${s.name}</td>
                <td><span class="text-truncate d-inline-block" style="max-width: 300px;" title="${s.description}">${s.description}</span></td>
                <td><span class="${badgeClass}">${badgeText}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${s.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${s.id}" title="Delete"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Bind Action Buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.currentTarget.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openDeleteModal(e.currentTarget.dataset.id));
        });
    }

    // ── Search & Filter ──
    function filterServices() {
        const query = searchInput.value.toLowerCase().trim();
        const status = filterStatus.value;

        const filtered = allServices.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
            const matchesStatus = (status === 'all') || (s.status === status);
            return matchesSearch && matchesStatus;
        });

        renderServices(filtered);
    }

    searchInput.addEventListener('input', filterServices);
    filterStatus.addEventListener('change', filterServices);

    // ── Icon Preview Logic ──
    iconInput.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('bi-') && val.length > 0) {
            val = 'bi-' + val; // auto-prefix if user just types 'house'
        }
        iconPreviewElement.className = `bi ${val}`;
    });

    // ── Add/Edit Modals ──
    addBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add New Service';
        serviceForm.reset();
        document.getElementById('serviceId').value = '';
        
        // Auto-increment order for new item
        const maxOrder = allServices.length > 0 ? Math.max(...allServices.map(s => s.displayOrder)) : 0;
        document.getElementById('serviceOrder').value = maxOrder + 1;
        
        iconPreviewElement.className = 'bi bi-tools';
        clearValidationErrors();
        serviceModal.show();
    });

    function openEditModal(id) {
        const service = allServices.find(s => s.id == id);
        if (!service) return;

        modalTitle.textContent = 'Edit Service';
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceName').value = service.name;
        document.getElementById('serviceDescription').value = service.description;
        document.getElementById('serviceIcon').value = service.icon || '';
        document.getElementById('serviceOrder').value = service.displayOrder;
        document.getElementById('serviceStatus').value = service.status;
        
        iconPreviewElement.className = `bi ${service.icon || 'bi-tools'}`;

        clearValidationErrors();
        serviceModal.show();
    }

    // ── Submit Form (Create / Update) ──
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateServiceForm()) {
            return;
        }

        const btn = document.getElementById('saveServiceBtn');
        const id = document.getElementById('serviceId').value;
        const isEdit = !!id;

        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';
        btn.disabled = true;

        const token = getToken();
        let iconVal = sanitizeText(document.getElementById('serviceIcon').value);
        if (!iconVal.startsWith('bi-') && iconVal.length > 0) iconVal = 'bi-' + iconVal;

        const payload = {
            name: sanitizeText(document.getElementById('serviceName').value),
            description: sanitizeText(document.getElementById('serviceDescription').value),
            icon: iconVal,
            displayOrder: document.getElementById('serviceOrder').value,
            status: document.getElementById('serviceStatus').value
        };

        const url = isEdit ? `${ADMIN_API}/api/services/${id}` : `${ADMIN_API}/api/services`;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                showToast(`Service ${isEdit ? 'updated' : 'added'} successfully!`);
                serviceModal.hide();
                loadServices();
            } else {
                alert(data.message || 'Failed to save service.');
            }
        } catch (error) {
            alert('Server error occurred.');
        } finally {
            btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save Service';
            btn.disabled = false;
        }
    });

    // ── Delete Logic ──
    function openDeleteModal(id) {
        document.getElementById('deleteServiceId').value = id;
        deleteModal.show();
    }

    document.getElementById('confirmDeleteBtn').addEventListener('click', async (e) => {
        const btn = e.target;
        const id = document.getElementById('deleteServiceId').value;
        const token = getToken();

        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Deleting...';
        btn.disabled = true;

        try {
            const res = await fetch(`${ADMIN_API}/api/services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            
            if (data.success) {
                showToast('Service deleted successfully.', 'danger');
                deleteModal.hide();
                loadServices();
            } else {
                alert(data.message || 'Failed to delete service.');
            }
        } catch (error) {
            alert('Server error occurred.');
        } finally {
            btn.innerHTML = '<i class="bi bi-trash me-1"></i>Delete';
            btn.disabled = false;
        }
    });

    // ── Init ──
    loadServices();
});
