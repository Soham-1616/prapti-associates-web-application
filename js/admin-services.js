/* ═══════════════════════════════════════════
   ADMIN SERVICES.JS — CMS Logic
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

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

        serviceModal.show();
    }

    // ── Submit Form (Create / Update) ──
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('saveServiceBtn');
        const id = document.getElementById('serviceId').value;
        const isEdit = !!id;

        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';
        btn.disabled = true;

        const token = getToken();
        let iconVal = document.getElementById('serviceIcon').value.trim();
        if (!iconVal.startsWith('bi-') && iconVal.length > 0) iconVal = 'bi-' + iconVal;

        const payload = {
            name: document.getElementById('serviceName').value,
            description: document.getElementById('serviceDescription').value,
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
