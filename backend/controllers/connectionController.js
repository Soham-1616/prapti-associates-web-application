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

// ── Validation Helpers ──
const VALID_CATEGORIES = ['architect', 'engineer', 'coworker', 'custom'];
const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

function sanitizeText(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ');
}

function containsMaliciousContent(str) {
    if (!str) return false;
    return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
}

function validateMemberFields(body, isCreate) {
    const errors = [];
    const { name, designation, category, customCategory, phone, email, linkedin } = body;

    // Full Name
    if (isCreate || name !== undefined) {
        const n = sanitizeText(name);
        if (!n) errors.push('Full Name is required.');
        else if (n.length < 3) errors.push('Full Name must be at least 3 characters.');
        else if (n.length > 100) errors.push('Full Name cannot exceed 100 characters.');
        else if (/^[0-9]+$/.test(n)) errors.push('Full Name cannot contain only numbers.');
        else if (!/^[a-zA-Z\s.\-]+$/.test(n)) errors.push('Full Name can only contain letters, spaces, periods, and hyphens.');
        else if (containsMaliciousContent(name)) errors.push('HTML or script tags are not allowed in Full Name.');
    }

    // Designation
    if (isCreate || designation !== undefined) {
        const d = sanitizeText(designation);
        if (!d) errors.push('Designation is required.');
        else if (d.length < 3) errors.push('Designation must be at least 3 characters.');
        else if (d.length > 100) errors.push('Designation cannot exceed 100 characters.');
        else if (containsMaliciousContent(designation)) errors.push('HTML or script tags are not allowed in Designation.');
    }

    // Category
    if (isCreate || category !== undefined) {
        const c = category ? category.toLowerCase() : '';
        if (!c) errors.push('Category is required.');
        else if (!VALID_CATEGORIES.includes(c)) errors.push('Please select a valid category.');
    }

    // Custom Category
    if (category && category.toLowerCase() === 'custom') {
        const cc = sanitizeText(customCategory);
        if (!cc) errors.push('Custom category name is required when category is Custom.');
        else if (cc.length > 50) errors.push('Custom category cannot exceed 50 characters.');
        else if (containsMaliciousContent(customCategory)) errors.push('HTML or script tags are not allowed in Custom Category.');
    }

    // Phone (optional)
    if (phone !== undefined && sanitizeText(phone)) {
        const p = sanitizeText(phone);
        const cleaned = p.replace(/[\s\-]/g, '');
        if (!/^(\+91)?[6-9]\d{9}$/.test(cleaned)) {
            errors.push('Please enter a valid phone number (10-digit Indian mobile or +91 prefix).');
        }
    }

    // Email (optional)
    if (email !== undefined && sanitizeText(email)) {
        const e = sanitizeText(email);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) errors.push('Please enter a valid email address.');
        else if (containsMaliciousContent(email)) errors.push('HTML or script tags are not allowed in Email.');
    }

    // LinkedIn (optional)
    if (linkedin !== undefined && sanitizeText(linkedin)) {
        const l = sanitizeText(linkedin);
        if (!/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(l)) {
            errors.push('LinkedIn URL must be a valid linkedin.com link (e.g., https://linkedin.com/in/username).');
        }
        if (containsMaliciousContent(linkedin)) errors.push('HTML or script tags are not allowed in LinkedIn URL.');
    }

    return { valid: errors.length === 0, errors };
}

function validateUploadedFile(file) {
    if (!file) return { valid: true, errors: [] };
    const errors = [];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(ext)) {
        errors.push('Profile photo must be JPG, JPEG, PNG, or WEBP.');
    }
    if (file.size > MAX_IMAGE_SIZE) {
        errors.push('Profile photo must be under 5 MB.');
    }
    return { valid: errors.length === 0, errors };
}

function sanitizeMemberBody(body) {
    const fields = ['name', 'designation', 'customCategory', 'phone', 'email', 'linkedin'];
    fields.forEach(f => { if (body[f] !== undefined) body[f] = sanitizeText(body[f]); });
    return body;
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

        // Validate input
        const validation = validateMemberFields(req.body, true);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Validate uploaded file
        const fileValidation = validateUploadedFile(req.file);
        if (!fileValidation.valid) {
            // Clean up temp file
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: fileValidation.errors[0], errors: fileValidation.errors });
        }

        // Sanitize input
        sanitizeMemberBody(req.body);
        const { name, designation, category, customCategory, phone, email, linkedin } = req.body;

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

        // Validate input
        const validation = validateMemberFields(req.body, false);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Validate uploaded file
        const fileValidation = validateUploadedFile(req.file);
        if (!fileValidation.valid) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: fileValidation.errors[0], errors: fileValidation.errors });
        }

        // Sanitize input
        sanitizeMemberBody(req.body);
        const { name, designation, category, customCategory, phone, email, linkedin } = req.body;

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
