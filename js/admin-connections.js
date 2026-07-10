/* ═══════════════════════════════════════════
   ADMIN-CONNECTIONS.JS — Connections Management Logic
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    const API = ADMIN_API + '/api/connections';
    const token = getToken();

    const connectionsBody = document.getElementById('connectionsBody');
    const connectionForm = document.getElementById('connectionForm');
    const connectionModal = new bootstrap.Modal(document.getElementById('connectionModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    const searchMemberInput = document.getElementById('searchMember');
    const filterCategorySelect = document.getElementById('filterCategory');

    const memberCategorySelect = document.getElementById('memberCategory');
    const customCategoryGroup = document.getElementById('customCategoryGroup');
    const memberCustomCategoryInput = document.getElementById('memberCustomCategory');

    let allMembers = []; // Cache list for search and filter operations

    // ── Toggle Custom Category Field ──
    memberCategorySelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            customCategoryGroup.style.display = 'block';
            memberCustomCategoryInput.required = true;
        } else {
            customCategoryGroup.style.display = 'none';
            memberCustomCategoryInput.required = false;
            memberCustomCategoryInput.value = '';
        }
    });

    // ── Load & Render Connections ──
    async function loadConnections() {
        try {
            const res = await fetch(API);
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            allMembers = data.data;
            applyFilters();

        } catch (error) {
            connectionsBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>Failed to load connections.
            </td></tr>`;
        }
    }

    // ── Render Rows ──
    function renderTableRows(members) {
        if (members.length === 0) {
            connectionsBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">
                <i class="bi bi-inbox me-2"></i>No members found matching the criteria.
            </td></tr>`;
            return;
        }

        connectionsBody.innerHTML = members.map(m => {
            let catLabel = '';
            if (m.category === 'architect') catLabel = 'Architect';
            else if (m.category === 'engineer') catLabel = 'Engineer';
            else if (m.category === 'coworker') catLabel = 'Worker Head';
            else if (m.category === 'custom') catLabel = m.customCategory || 'Custom';
            else catLabel = m.category;

            // Image handling (support local files as well as remote urls/ui-avatars)
            let photoSrc = m.photo;
            if (photoSrc && !photoSrc.startsWith('http') && !photoSrc.startsWith('https')) {
                photoSrc = ADMIN_API + '/' + photoSrc;
            }

            const photoHtml = photoSrc
                ? `<img src="${photoSrc}" alt="${m.name}" class="connection-photo-thumb" />`
                : `<div class="connection-photo-placeholder"><i class="bi bi-person"></i></div>`;

            return `<tr>
                <td>${photoHtml}</td>
                <td class="fw-semibold">${m.name}</td>
                <td>${m.designation}</td>
                <td><span class="badge bg-light text-dark">${catLabel}</span></td>
                <td>${m.phone || '—'}</td>
                <td>${m.email || '—'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="editMember(${m.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="deleteMember(${m.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }

    // ── Apply Search & Category Filter ──
    function applyFilters() {
        const query = searchMemberInput.value.toLowerCase().trim();
        const categoryFilter = filterCategorySelect.value;

        const filtered = allMembers.filter(m => {
            // Category check
            const matchesCategory = categoryFilter === 'all' || 
                m.category === categoryFilter;

            // Search query check (name, designation, category)
            const catLabel = m.category === 'coworker' ? 'worker head' : m.category.toLowerCase();
            const customCat = (m.customCategory || '').toLowerCase();
            const matchesSearch = !query || 
                m.name.toLowerCase().includes(query) || 
                m.designation.toLowerCase().includes(query) || 
                catLabel.includes(query) ||
                customCat.includes(query);

            return matchesCategory && matchesSearch;
        });

        renderTableRows(filtered);
    }

    // Bind real-time search & filter
    searchMemberInput.addEventListener('keyup', applyFilters);
    filterCategorySelect.addEventListener('change', applyFilters);

    // ── Show Toast ──
    function showToast(message, type = 'success') {
        const toast = document.getElementById('adminToast');
        const toastMsg = document.getElementById('toastMessage');
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toastMsg.textContent = message;
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
    }

    // ── Profile Photo Preview ──
    document.getElementById('memberPhoto').addEventListener('change', function () {
        const previewContainer = document.getElementById('photoPreviewContainer');
        const previewName = document.getElementById('photoPreviewName');
        previewContainer.innerHTML = '';
        previewName.textContent = 'No file chosen';

        if (this.files[0]) {
            const file = this.files[0];
            previewName.textContent = file.name;
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'photo-preview';
            previewContainer.appendChild(img);
        }
    });

    // ── Add Member Button ──
    document.getElementById('addMemberBtn').addEventListener('click', () => {
        document.getElementById('connectionModalLabel').textContent = 'Add New Member';
        connectionForm.reset();
        document.getElementById('memberId').value = '';
        customCategoryGroup.style.display = 'none';
        memberCustomCategoryInput.required = false;
        document.getElementById('photoPreviewContainer').innerHTML = '';
        document.getElementById('photoPreviewName').textContent = 'No file chosen';
        connectionModal.show();
    });

    // ── Edit Member ──
    window.editMember = async function (id) {
        try {
            const res = await fetch(API + '/' + id);
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            const m = data.data;
            document.getElementById('connectionModalLabel').textContent = 'Edit Member';
            document.getElementById('memberId').value = m.id;
            document.getElementById('memberName').value = m.name;
            document.getElementById('memberDesignation').value = m.designation;
            document.getElementById('memberCategory').value = m.category;

            if (m.category === 'custom') {
                customCategoryGroup.style.display = 'block';
                memberCustomCategoryInput.required = true;
                memberCustomCategoryInput.value = m.customCategory || '';
            } else {
                customCategoryGroup.style.display = 'none';
                memberCustomCategoryInput.required = false;
                memberCustomCategoryInput.value = '';
            }

            document.getElementById('memberPhone').value = m.phone || '';
            document.getElementById('memberEmail').value = m.email || '';
            document.getElementById('memberLinkedin').value = m.linkedin || '';

            // Show existing profile photo preview
            const previewContainer = document.getElementById('photoPreviewContainer');
            previewContainer.innerHTML = '';
            document.getElementById('photoPreviewName').textContent = 'Keep existing image';
            if (m.photo) {
                let photoSrc = m.photo;
                if (!photoSrc.startsWith('http') && !photoSrc.startsWith('https')) {
                    photoSrc = ADMIN_API + '/' + photoSrc;
                }
                const img = document.createElement('img');
                img.src = photoSrc;
                img.className = 'photo-preview';
                previewContainer.appendChild(img);
            }

            // Clear file input
            document.getElementById('memberPhoto').value = '';

            connectionModal.show();

        } catch (error) {
            showToast('Failed to load member data.', 'danger');
        }
    };

    // ── Delete Member ──
    window.deleteMember = function (id) {
        document.getElementById('deleteMemberId').value = id;
        deleteModal.show();
    };

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        const id = document.getElementById('deleteMemberId').value;
        try {
            const res = await fetch(API + '/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token },
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            deleteModal.hide();
            showToast('Member deleted successfully.');
            loadConnections();

        } catch (error) {
            showToast('Failed to delete member.', 'danger');
        }
    });

    // ── Save Member (Create / Update) ──
    connectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('memberId').value;
        const isEdit = !!id;

        const formData = new FormData();
        formData.append('name', document.getElementById('memberName').value);
        formData.append('designation', document.getElementById('memberDesignation').value);
        formData.append('category', document.getElementById('memberCategory').value);
        formData.append('customCategory', document.getElementById('memberCustomCategory').value);
        formData.append('phone', document.getElementById('memberPhone').value);
        formData.append('email', document.getElementById('memberEmail').value);
        formData.append('linkedin', document.getElementById('memberLinkedin').value);

        // Profile Photo
        const photoFile = document.getElementById('memberPhoto').files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        const saveBtn = document.getElementById('saveMemberBtn');
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

            connectionModal.hide();
            showToast(isEdit ? 'Member updated successfully.' : 'Member added successfully.');
            loadConnections();

        } catch (error) {
            showToast(error.message || 'Failed to save member.', 'danger');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save Member';
        }
    });

    // ── Initial Load ──
    loadConnections();
});
