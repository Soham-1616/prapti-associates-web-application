// ═══════════════════════════════════════════
//  CONNECTION CONTROLLER — CRUD Operations
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'connections.json');
const FRONTEND_ROOT = path.join(__dirname, '..', '..');

// Ensure connections images directory exists
const connectionsImgDir = path.join(FRONTEND_ROOT, 'images', 'connections');
if (!fs.existsSync(connectionsImgDir)) {
    fs.mkdirSync(connectionsImgDir, { recursive: true });
}

// Helper: Read/Write JSON
function readConnections() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeConnections(connections) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(connections, null, 4), 'utf-8');
}

// ────────────────────────────────────────────
//  GET /api/connections — List all members
// ────────────────────────────────────────────
exports.getAll = (req, res) => {
    try {
        const connections = readConnections();
        return res.json({ success: true, data: connections });
    } catch (error) {
        console.error('❌ Error reading connections:', error);
        return res.status(500).json({ success: false, message: 'Failed to load connections.' });
    }
};

// ────────────────────────────────────────────
//  GET /api/connections/:id — Get single member
// ────────────────────────────────────────────
exports.getById = (req, res) => {
    try {
        const connections = readConnections();
        const member = connections.find(c => c.id === parseInt(req.params.id));
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }
        return res.json({ success: true, data: member });
    } catch (error) {
        console.error('❌ Error reading member:', error);
        return res.status(500).json({ success: false, message: 'Failed to load member.' });
    }
};

// ────────────────────────────────────────────
//  POST /api/connections — Add new member
// ────────────────────────────────────────────
exports.create = (req, res) => {
    try {
        const connections = readConnections();
        const { name, designation, category, customCategory, phone, email, linkedin } = req.body;

        // Validation
        if (!name || !designation || !category) {
            return res.status(400).json({ success: false, message: 'Name, designation, and category are required.' });
        }

        if (category === 'custom' && !customCategory) {
            return res.status(400).json({ success: false, message: 'Custom category is required when category is set to Custom.' });
        }

        const newId = connections.length > 0 ? Math.max(...connections.map(c => c.id)) + 1 : 1;
        let photo = '';

        // Handle profile photo upload
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const filename = `member-${newId}-${Date.now()}${ext}`;
            const dest = path.join(connectionsImgDir, filename);

            fs.copyFileSync(req.file.path, dest);
            fs.unlinkSync(req.file.path);

            photo = 'images/connections/' + filename;
        } else {
            // Default avatar fallback
            const encodedName = encodeURIComponent(name);
            photo = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=200&font-size=0.4&bold=true`;
        }

        const newMember = {
            id: newId,
            name,
            designation,
            category: category.toLowerCase(),
            customCategory: category === 'custom' ? customCategory : '',
            photo,
            phone: phone || '',
            email: email || '',
            linkedin: linkedin || ''
        };

        connections.push(newMember);
        writeConnections(connections);

        return res.status(201).json({ success: true, message: 'Member created successfully.', data: newMember });

    } catch (error) {
        console.error('❌ Error creating connection member:', error);
        return res.status(500).json({ success: false, message: 'Failed to add connection member.' });
    }
};

// ────────────────────────────────────────────
//  PUT /api/connections/:id — Update member
// ────────────────────────────────────────────
exports.update = (req, res) => {
    try {
        const connections = readConnections();
        const id = parseInt(req.params.id);
        const index = connections.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }

        const existing = connections[index];
        const { name, designation, category, customCategory, phone, email, linkedin } = req.body;

        // Validation
        if (category === 'custom' && !customCategory) {
            return res.status(400).json({ success: false, message: 'Custom category is required when category is set to Custom.' });
        }

        let photo = existing.photo;

        // Handle profile photo upload
        if (req.file) {
            // Remove old uploaded image if it exists
            if (existing.photo && existing.photo.startsWith('images/connections/')) {
                const oldPath = path.join(FRONTEND_ROOT, existing.photo);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            const ext = path.extname(req.file.originalname);
            const filename = `member-${id}-${Date.now()}${ext}`;
            const dest = path.join(connectionsImgDir, filename);

            fs.copyFileSync(req.file.path, dest);
            fs.unlinkSync(req.file.path);

            photo = 'images/connections/' + filename;
        }

        // Merge updates
        connections[index] = {
            ...existing,
            name: name || existing.name,
            designation: designation || existing.designation,
            category: category ? category.toLowerCase() : existing.category,
            customCategory: category === 'custom' ? customCategory : (category ? '' : existing.customCategory),
            photo,
            phone: phone !== undefined ? phone : existing.phone,
            email: email !== undefined ? email : existing.email,
            linkedin: linkedin !== undefined ? linkedin : existing.linkedin
        };

        writeConnections(connections);

        return res.json({ success: true, message: 'Member updated successfully.', data: connections[index] });

    } catch (error) {
        console.error('❌ Error updating connection member:', error);
        return res.status(500).json({ success: false, message: 'Failed to update connection member.' });
    }
};

// ────────────────────────────────────────────
//  DELETE /api/connections/:id — Delete member
// ────────────────────────────────────────────
exports.remove = (req, res) => {
    try {
        const connections = readConnections();
        const id = parseInt(req.params.id);
        const index = connections.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }

        const removed = connections.splice(index, 1)[0];

        // Delete profile photo if it was uploaded
        if (removed.photo && removed.photo.startsWith('images/connections/')) {
            const photoPath = path.join(FRONTEND_ROOT, removed.photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        writeConnections(connections);

        return res.json({ success: true, message: 'Member deleted successfully.', data: removed });

    } catch (error) {
        console.error('❌ Error deleting connection member:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete connection member.' });
    }
};
