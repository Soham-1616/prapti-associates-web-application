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
        const { name, description, icon, displayOrder, status } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({ success: false, message: 'Name and description are required.' });
        }

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
        const { name, description, icon, displayOrder, status } = req.body;

        // Validation
        if (!name && name !== undefined) {
            return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
        }
        if (!description && description !== undefined) {
            return res.status(400).json({ success: false, message: 'Description cannot be empty.' });
        }

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
