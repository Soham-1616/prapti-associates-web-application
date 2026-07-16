// ═══════════════════════════════════════════
//  PROJECT CONTROLLER — CRUD Operations
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'projects.json');
// Store images within backend directory (works on Render where frontend is on Vercel)
const IMAGES_ROOT = path.join(__dirname, '..');

// ── Helper: Read/Write JSON ──
function readProjects() {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeProjects(projects) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 4), 'utf-8');
}

function generateSlug(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ── Validation Helpers ──
const VALID_CATEGORIES = ['residential', 'commercial', 'institutional', 'industrial'];
const VALID_STATUSES = ['Ongoing', 'Completed', 'Upcoming'];

function sanitizeText(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ');
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

function validateProjectFields(body, isCreate) {
    const errors = [];
    const { name, category, clientName, location, year, area, description, description2, status } = body;
    const currentYear = new Date().getFullYear();

    // Project Name
    if (isCreate || name !== undefined) {
        const n = sanitizeText(name);
        if (!n) errors.push('Project Name is required.');
        else if (n.length < 3) errors.push('Project Name must be at least 3 characters.');
        else if (n.length > 100) errors.push('Project Name cannot exceed 100 characters.');
        else if (!/^[a-zA-Z0-9\s\-&.,]+$/.test(n)) errors.push('Project Name contains invalid characters.');
        else if (containsMaliciousContent(name)) errors.push('HTML or script tags are not allowed in Project Name.');
    }

    // Category
    if (isCreate || category !== undefined) {
        const c = category ? category.toLowerCase() : '';
        if (!c) errors.push('Category is required.');
        else if (!VALID_CATEGORIES.includes(c)) errors.push('Category must be one of: ' + VALID_CATEGORIES.join(', ') + '.');
    }

    // Client Name (optional)
    if (clientName !== undefined && sanitizeText(clientName)) {
        const cn = sanitizeText(clientName);
        if (cn.length < 3) errors.push('Client Name must be at least 3 characters.');
        else if (cn.length > 100) errors.push('Client Name cannot exceed 100 characters.');
        else if (containsMaliciousContent(clientName)) errors.push('HTML or script tags are not allowed in Client Name.');
    }

    // Location
    if (isCreate || location !== undefined) {
        const loc = sanitizeText(location);
        if (!loc) errors.push('Location is required.');
        else if (loc.length > 100) errors.push('Location cannot exceed 100 characters.');
        else if (containsMaliciousContent(location)) errors.push('HTML or script tags are not allowed in Location.');
    }

    // Year
    if (isCreate || year !== undefined) {
        const y = sanitizeText(year);
        if (!y) errors.push('Year is required.');
        else if (!/^\d{4}$/.test(y)) errors.push('Year must be a valid 4-digit number.');
        else {
            const yNum = parseInt(y);
            if (yNum < 1900 || yNum > currentYear + 5) errors.push('Year must be between 1900 and ' + (currentYear + 5) + '.');
        }
    }

    // Area
    if (isCreate || area !== undefined) {
        const a = sanitizeText(area);
        if (!a) errors.push('Area is required.');
        else if (!extractAreaNumber(a)) errors.push('Area must be a positive number (e.g., 3200 or 3200 sq.ft).');
        else if (containsMaliciousContent(area)) errors.push('HTML or script tags are not allowed in Area.');
    }

    // Description
    if (isCreate || description !== undefined) {
        const d = sanitizeText(description);
        if (!d) errors.push('Description is required.');
        else if (d.length < 30) errors.push('Description must be at least 30 characters.');
        else if (d.length > 3000) errors.push('Description cannot exceed 3000 characters.');
        else if (containsMaliciousContent(description)) errors.push('HTML or script tags are not allowed in Description.');
    }

    // Additional Description (optional)
    if (description2 !== undefined && sanitizeText(description2)) {
        const d2 = sanitizeText(description2);
        if (d2.length < 30) errors.push('Additional Description must be at least 30 characters.');
        else if (d2.length > 3000) errors.push('Additional Description cannot exceed 3000 characters.');
        else if (containsMaliciousContent(description2)) errors.push('HTML or script tags are not allowed in Additional Description.');
    }

    // Status
    if (status !== undefined && status && !VALID_STATUSES.includes(status)) {
        errors.push('Status must be one of: ' + VALID_STATUSES.join(', ') + '.');
    }

    return { valid: errors.length === 0, errors };
}

function sanitizeBody(body) {
    const fields = ['name', 'clientName', 'location', 'year', 'area', 'description', 'description2'];
    fields.forEach(f => { if (body[f] !== undefined) body[f] = sanitizeText(body[f]); });
    return body;
}

// ────────────────────────────────────────────
//  GET /api/projects — List all projects
// ────────────────────────────────────────────
exports.getAll = (req, res) => {
    try {
        const projects = readProjects();
        return res.json({ success: true, data: projects });
    } catch (error) {
        console.error('❌ Error reading projects:', error);
        return res.status(500).json({ success: false, message: 'Failed to load projects.' });
    }
};

// ────────────────────────────────────────────
//  GET /api/projects/:id — Single project
// ────────────────────────────────────────────
exports.getById = (req, res) => {
    try {
        const projects = readProjects();
        const project = projects.find(p => p.id === parseInt(req.params.id));
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        return res.json({ success: true, data: project });
    } catch (error) {
        console.error('❌ Error reading project:', error);
        return res.status(500).json({ success: false, message: 'Failed to load project.' });
    }
};

// ────────────────────────────────────────────
//  POST /api/projects — Create new project
// ────────────────────────────────────────────
exports.create = (req, res) => {
    try {
        const projects = readProjects();
        // Validate input
        const validation = validateProjectFields(req.body, true);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Sanitize input
        sanitizeBody(req.body);
        const { name, category, clientName, location, year, area, status, description, description2 } = req.body;

        const slug = generateSlug(name);
        const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;

        // Handle image uploads
        const projectImgDir = path.join(IMAGES_ROOT, 'images', 'projects', slug);
        if (!fs.existsSync(projectImgDir)) {
            fs.mkdirSync(projectImgDir, { recursive: true });
        }

        let heroImage = '';
        let galleryImages = [];

        if (req.files) {
            // Hero image
            if (req.files.heroImage && req.files.heroImage[0]) {
                const heroFile = req.files.heroImage[0];
                const heroExt = path.extname(heroFile.originalname);
                const heroFilename = 'hero' + heroExt;
                const heroDest = path.join(projectImgDir, heroFilename);
                fs.copyFileSync(heroFile.path, heroDest);
                fs.unlinkSync(heroFile.path);
                heroImage = 'images/projects/' + slug + '/' + heroFilename;
            }

            // Gallery images
            if (req.files.galleryImages) {
                req.files.galleryImages.forEach((file, index) => {
                    const ext = path.extname(file.originalname);
                    const filename = 'gallery-' + (index + 1) + ext;
                    const dest = path.join(projectImgDir, filename);
                    fs.copyFileSync(file.path, dest);
                    fs.unlinkSync(file.path);
                    galleryImages.push('images/projects/' + slug + '/' + filename);
                });
            }
        }

        const newProject = {
            id: newId,
            name,
            slug,
            category: category.toLowerCase(),
            clientName: clientName || '',
            location: location || '',
            year: year || '',
            area: area || '',
            status: status || 'Ongoing',
            description: description || '',
            description2: description2 || '',
            heroImage,
            galleryImages,
        };

        projects.push(newProject);
        writeProjects(projects);

        return res.status(201).json({ success: true, message: 'Project created successfully.', data: newProject });

    } catch (error) {
        console.error('❌ Error creating project:', error);
        return res.status(500).json({ success: false, message: 'Failed to create project.' });
    }
};

// ────────────────────────────────────────────
//  PUT /api/projects/:id — Update project
// ────────────────────────────────────────────
exports.update = (req, res) => {
    try {
        const projects = readProjects();
        const id = parseInt(req.params.id);
        const index = projects.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        const existing = projects[index];

        // Validate input
        const validation = validateProjectFields(req.body, false);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Sanitize input
        sanitizeBody(req.body);
        const { name, category, clientName, location, year, area, status, description, description2 } = req.body;

        // Update slug if name changed
        const slug = name ? generateSlug(name) : existing.slug;

        // Handle image directory rename if slug changed
        if (slug !== existing.slug) {
            const oldDir = path.join(IMAGES_ROOT, 'images', 'projects', existing.slug);
            const newDir = path.join(IMAGES_ROOT, 'images', 'projects', slug);
            if (fs.existsSync(oldDir)) {
                fs.renameSync(oldDir, newDir);
                // Update existing image paths
                if (existing.heroImage) {
                    existing.heroImage = existing.heroImage.replace(existing.slug, slug);
                }
                existing.galleryImages = (existing.galleryImages || []).map(img =>
                    img.replace(existing.slug, slug)
                );
            }
        }

        const projectImgDir = path.join(IMAGES_ROOT, 'images', 'projects', slug);
        if (!fs.existsSync(projectImgDir)) {
            fs.mkdirSync(projectImgDir, { recursive: true });
        }

        let heroImage = existing.heroImage;
        let galleryImages = [...(existing.galleryImages || [])];

        if (req.files) {
            // New hero image
            if (req.files.heroImage && req.files.heroImage[0]) {
                const heroFile = req.files.heroImage[0];
                const heroExt = path.extname(heroFile.originalname);
                const heroFilename = 'hero' + heroExt;
                const heroDest = path.join(projectImgDir, heroFilename);
                fs.copyFileSync(heroFile.path, heroDest);
                fs.unlinkSync(heroFile.path);
                heroImage = 'images/projects/' + slug + '/' + heroFilename;
            }

            // New gallery images (replace all)
            if (req.files.galleryImages && req.files.galleryImages.length > 0) {
                // Clear old gallery files
                galleryImages.forEach(img => {
                    const oldPath = path.join(IMAGES_ROOT, img);
                    if (fs.existsSync(oldPath) && img.includes('gallery-')) {
                        fs.unlinkSync(oldPath);
                    }
                });
                galleryImages = [];

                req.files.galleryImages.forEach((file, index) => {
                    const ext = path.extname(file.originalname);
                    const filename = 'gallery-' + (index + 1) + ext;
                    const dest = path.join(projectImgDir, filename);
                    fs.copyFileSync(file.path, dest);
                    fs.unlinkSync(file.path);
                    galleryImages.push('images/projects/' + slug + '/' + filename);
                });
            }
        }

        // Merge updates
        projects[index] = {
            ...existing,
            name: name || existing.name,
            slug,
            category: category ? category.toLowerCase() : existing.category,
            clientName: clientName !== undefined ? clientName : existing.clientName,
            location: location !== undefined ? location : existing.location,
            year: year !== undefined ? year : existing.year,
            area: area !== undefined ? area : existing.area,
            status: status !== undefined ? status : existing.status,
            description: description !== undefined ? description : existing.description,
            description2: description2 !== undefined ? description2 : existing.description2,
            heroImage,
            galleryImages,
        };

        writeProjects(projects);

        return res.json({ success: true, message: 'Project updated successfully.', data: projects[index] });

    } catch (error) {
        console.error('❌ Error updating project:', error);
        return res.status(500).json({ success: false, message: 'Failed to update project.' });
    }
};

// ────────────────────────────────────────────
//  DELETE /api/projects/:id — Delete project
// ────────────────────────────────────────────
exports.remove = (req, res) => {
    try {
        const projects = readProjects();
        const id = parseInt(req.params.id);
        const index = projects.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        const removed = projects.splice(index, 1)[0];
        writeProjects(projects);

        return res.json({ success: true, message: 'Project deleted successfully.', data: removed });

    } catch (error) {
        console.error('❌ Error deleting project:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete project.' });
    }
};
