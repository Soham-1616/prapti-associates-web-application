// ═══════════════════════════════════════════
//  PROJECT CONTROLLER — CRUD Operations
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'projects.json');
const FRONTEND_ROOT = path.join(__dirname, '..', '..');

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
        const { name, category, clientName, location, year, area, status, description, description2 } = req.body;

        // Validation
        if (!name || !category) {
            return res.status(400).json({ success: false, message: 'Project name and category are required.' });
        }

        const slug = generateSlug(name);
        const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;

        // Handle image uploads
        const projectImgDir = path.join(FRONTEND_ROOT, 'images', 'projects', slug);
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
        const { name, category, clientName, location, year, area, status, description, description2 } = req.body;

        // Update slug if name changed
        const slug = name ? generateSlug(name) : existing.slug;

        // Handle image directory rename if slug changed
        if (slug !== existing.slug) {
            const oldDir = path.join(FRONTEND_ROOT, 'images', 'projects', existing.slug);
            const newDir = path.join(FRONTEND_ROOT, 'images', 'projects', slug);
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

        const projectImgDir = path.join(FRONTEND_ROOT, 'images', 'projects', slug);
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
                    const oldPath = path.join(FRONTEND_ROOT, img);
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
