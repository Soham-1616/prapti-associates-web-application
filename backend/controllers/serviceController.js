// ═══════════════════════════════════════════
//  SERVICE CONTROLLER — CRUD Operations
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'services.json');

// Helper: Read/Write JSON
function readServices() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeServices(services) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(services, null, 4), 'utf-8');
}

// ── Validation Helpers ──
const VALID_STATUSES = ['active', 'inactive'];

function sanitizeText(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ');
}

function containsMaliciousContent(str) {
    if (!str) return false;
    return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
}

function validateServiceFields(body, isCreate) {
    const errors = [];
    const { name, description, icon, displayOrder, status } = body;

    // Service Name
    if (isCreate || name !== undefined) {
        const n = sanitizeText(name);
        if (!n) errors.push('Service Name is required.');
        else if (n.length < 3) errors.push('Service Name must be at least 3 characters.');
        else if (n.length > 100) errors.push('Service Name cannot exceed 100 characters.');
        else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(n)) errors.push('Service Name contains invalid characters.');
        else if (containsMaliciousContent(name)) errors.push('HTML or script tags are not allowed in Service Name.');
    }

    // Description
    if (isCreate || description !== undefined) {
        const d = sanitizeText(description);
        if (!d) errors.push('Description is required.');
        else if (d.length < 20) errors.push('Description must be at least 20 characters.');
        else if (d.length > 500) errors.push('Description cannot exceed 500 characters.');
        else if (containsMaliciousContent(description)) errors.push('HTML or script tags are not allowed in Description.');
    }

    // Icon
    if (isCreate || icon !== undefined) {
        const ic = sanitizeText(icon);
        if (!ic) errors.push('Icon class is required.');
        else if (!/^bi-[a-z0-9-]+$/.test(ic)) errors.push('Please enter a valid Bootstrap Icon class (e.g., bi-tools, bi-building).');
        else if (containsMaliciousContent(icon)) errors.push('HTML or script tags are not allowed in Icon.');
    }

    // Display Order
    if (isCreate || displayOrder !== undefined) {
        const o = parseInt(displayOrder);
        if (!displayOrder && displayOrder !== 0) errors.push('Display Order is required.');
        else if (isNaN(o) || !Number.isInteger(o)) errors.push('Display Order must be a whole number.');
        else if (o < 1 || o > 999) errors.push('Display Order must be between 1 and 999.');
    }

    // Status
    if (isCreate || status !== undefined) {
        if (!status) errors.push('Status is required.');
        else if (!VALID_STATUSES.includes(status)) errors.push('Status must be Active or Inactive.');
    }

    return { valid: errors.length === 0, errors };
}

function sanitizeServiceBody(body) {
    const fields = ['name', 'description', 'icon'];
    fields.forEach(f => { if (body[f] !== undefined) body[f] = sanitizeText(body[f]); });
    return body;
}

// ────────────────────────────────────────────
//  GET /api/services — List all services
// ────────────────────────────────────────────
exports.getAll = (req, res) => {
    try {
        let services = readServices();
        
        // If query param activeOnly=true is passed, filter the results
        if (req.query.activeOnly === 'true') {
            services = services.filter(s => s.status === 'active');
        }

        // Always sort by displayOrder
        services.sort((a, b) => a.displayOrder - b.displayOrder);

        return res.json({ success: true, data: services });
    } catch (error) {
        console.error('❌ Error reading services:', error);
        return res.status(500).json({ success: false, message: 'Failed to load services.' });
    }
};

// ────────────────────────────────────────────
//  GET /api/services/:id — Get single service
// ────────────────────────────────────────────
exports.getById = (req, res) => {
    try {
        const services = readServices();
        const service = services.find(s => s.id === parseInt(req.params.id));
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }
        return res.json({ success: true, data: service });
    } catch (error) {
        console.error('❌ Error reading service:', error);
        return res.status(500).json({ success: false, message: 'Failed to load service.' });
    }
};

// ────────────────────────────────────────────
//  POST /api/services — Add new service
// ────────────────────────────────────────────
exports.create = (req, res) => {
    try {
        const services = readServices();

        // Validate input
        const validation = validateServiceFields(req.body, true);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Sanitize input
        sanitizeServiceBody(req.body);
        const { name, description, icon, displayOrder, status } = req.body;

        const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
        
        // If displayOrder not provided, put it at the end
        const order = displayOrder ? parseInt(displayOrder) : newId;

        const newService = {
            id: newId,
            name: name.trim(),
            description: description.trim(),
            icon: icon ? icon.trim() : 'bi-tools', // default icon if none provided
            displayOrder: order,
            status: status === 'inactive' ? 'inactive' : 'active'
        };

        services.push(newService);
        writeServices(services);

        return res.status(201).json({ success: true, message: 'Service created successfully.', data: newService });

    } catch (error) {
        console.error('❌ Error creating service:', error);
        return res.status(500).json({ success: false, message: 'Failed to add service.' });
    }
};

// ────────────────────────────────────────────
//  PUT /api/services/:id — Update service
// ────────────────────────────────────────────
exports.update = (req, res) => {
    try {
        const services = readServices();
        const id = parseInt(req.params.id);
        const index = services.findIndex(s => s.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        const existing = services[index];

        // Validate input
        const validation = validateServiceFields(req.body, false);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Sanitize input
        sanitizeServiceBody(req.body);
        const { name, description, icon, displayOrder, status } = req.body;

        // Merge updates
        services[index] = {
            ...existing,
            name: name !== undefined ? name.trim() : existing.name,
            description: description !== undefined ? description.trim() : existing.description,
            icon: icon !== undefined ? icon.trim() : existing.icon,
            displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : existing.displayOrder,
            status: status !== undefined ? status : existing.status
        };

        writeServices(services);

        return res.json({ success: true, message: 'Service updated successfully.', data: services[index] });

    } catch (error) {
        console.error('❌ Error updating service:', error);
        return res.status(500).json({ success: false, message: 'Failed to update service.' });
    }
};

// ────────────────────────────────────────────
//  DELETE /api/services/:id — Delete service
// ────────────────────────────────────────────
exports.remove = (req, res) => {
    try {
        const services = readServices();
        const id = parseInt(req.params.id);
        const index = services.findIndex(s => s.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        const removed = services.splice(index, 1)[0];
        writeServices(services);

        return res.json({ success: true, message: 'Service deleted successfully.', data: removed });

    } catch (error) {
        console.error('❌ Error deleting service:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete service.' });
    }
};
