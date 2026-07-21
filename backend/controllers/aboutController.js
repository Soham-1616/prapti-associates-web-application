// ═══════════════════════════════════════════
//  ABOUT CONTROLLER — CMS Operations
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'about.json');
const FRONTEND_ROOT = path.join(__dirname, '..', '..');
const IMAGES_DIR = path.join(FRONTEND_ROOT, 'images');

// Helper: Read/Write About Data
function readAboutData() {
    if (!fs.existsSync(DATA_FILE)) {
        // Fallback default
        const defaultData = {
            introTitle: "Building Dreams Since 2012",
            introDesc: "Prapti Associates was founded with a simple yet powerful mission...",
            aboutImage: "images/about-construction.png",
            experienceYears: "12+",
            experienceLabel: "Years of Excellence",
            missionText: "To deliver world-class...",
            visionText: "To be the most...",
            valuesText: "Integrity, transparency..."
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 4), 'utf-8');
        return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeAboutData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), 'utf-8');
}

// ── Validation Helpers ──
function sanitizeText(str) {
    if (!str) return '';
    return str.toString().trim().replace(/  +/g, ' ');
}

function sanitizeMultiline(str) {
    if (!str) return '';
    // Trim overall, collapse spaces within lines but preserve paragraph breaks
    return str.toString().trim().replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n');
}

function containsMaliciousContent(str) {
    if (!str) return false;
    return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
}

function isValidExperienceYears(val) {
    if (!val) return false;
    // Allow: 12, 12+, 25+, 99+ — digits 1-99 with optional +
    return /^[1-9]\d?[+]?$/.test(val.trim());
}

function isValidBootstrapIcon(val) {
    if (!val) return false;
    // Must start with bi- and contain only lowercase letters, numbers, hyphens
    return /^bi-[a-z0-9-]+$/.test(val.trim());
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function validateAboutFields(body, file) {
    const errors = [];

    // Introduction Title
    const title = sanitizeText(body.introTitle);
    if (!title) errors.push('Introduction Title is required.');
    else if (title.length < 5) errors.push('Introduction Title must be at least 5 characters.');
    else if (title.length > 100) errors.push('Introduction Title cannot exceed 100 characters.');
    else if (containsMaliciousContent(body.introTitle)) errors.push('HTML or script tags are not allowed in Introduction Title.');

    // Company Description
    const desc = sanitizeMultiline(body.introDesc);
    if (!desc) errors.push('Company Description is required.');
    else if (desc.length < 100) errors.push('Company Description must be at least 100 characters.');
    else if (desc.length > 3000) errors.push('Company Description cannot exceed 3000 characters.');
    else if (containsMaliciousContent(body.introDesc)) errors.push('HTML or script tags are not allowed in Company Description.');

    // Experience Years
    const ey = sanitizeText(body.experienceYears);
    if (!ey) errors.push('Experience Years is required.');
    else if (!isValidExperienceYears(ey)) errors.push('Please enter a valid experience value (e.g. 12, 25+).');
    else if (containsMaliciousContent(body.experienceYears)) errors.push('HTML or script tags are not allowed in Experience Years.');

    // Experience Label
    const el = sanitizeText(body.experienceLabel);
    if (!el) errors.push('Experience Label is required.');
    else if (el.length < 3) errors.push('Experience Label must be at least 3 characters.');
    else if (el.length > 40) errors.push('Experience Label cannot exceed 40 characters.');
    else if (containsMaliciousContent(body.experienceLabel)) errors.push('HTML or script tags are not allowed in Experience Label.');

    // Company Photo (only if file is uploaded)
    if (file) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            errors.push('Only JPG, JPEG, PNG and WEBP images are allowed.');
        }
        if (file.size > MAX_IMAGE_SIZE) {
            errors.push('Image file size cannot exceed 5MB.');
        }
    }

    // Mission
    const mission = sanitizeMultiline(body.missionText);
    if (!mission) errors.push('Mission Text is required.');
    else if (mission.length < 20) errors.push('Mission Text must be at least 20 characters.');
    else if (mission.length > 500) errors.push('Mission Text cannot exceed 500 characters.');
    else if (containsMaliciousContent(body.missionText)) errors.push('HTML or script tags are not allowed in Mission Text.');

    // Vision
    const vision = sanitizeMultiline(body.visionText);
    if (!vision) errors.push('Vision Text is required.');
    else if (vision.length < 20) errors.push('Vision Text must be at least 20 characters.');
    else if (vision.length > 500) errors.push('Vision Text cannot exceed 500 characters.');
    else if (containsMaliciousContent(body.visionText)) errors.push('HTML or script tags are not allowed in Vision Text.');

    // Values
    const values = sanitizeMultiline(body.valuesText);
    if (!values) errors.push('Values Text is required.');
    else if (values.length < 20) errors.push('Values Text must be at least 20 characters.');
    else if (values.length > 800) errors.push('Values Text cannot exceed 800 characters.');
    else if (containsMaliciousContent(body.valuesText)) errors.push('HTML or script tags are not allowed in Values Text.');

    // Achievements Heading (optional)
    if (body.achievementsHeading && sanitizeText(body.achievementsHeading)) {
        const ah = sanitizeText(body.achievementsHeading);
        if (ah.length > 80) errors.push('Achievements Heading cannot exceed 80 characters.');
        else if (containsMaliciousContent(body.achievementsHeading)) errors.push('HTML or script tags are not allowed in Achievements Heading.');
    }

    // Achievement Texts (1-4)
    [['ach1Text', 'Achievement 1 Text'], ['ach2Text', 'Achievement 2 Text'], ['ach3Text', 'Achievement 3 Text'], ['ach4Text', 'Achievement 4 Text']].forEach(([key, label]) => {
        const v = sanitizeText(body[key]);
        if (!v) errors.push(label + ' is required.');
        else if (v.length < 3) errors.push(label + ' must be at least 3 characters.');
        else if (v.length > 60) errors.push(label + ' cannot exceed 60 characters.');
        else if (containsMaliciousContent(body[key])) errors.push('HTML or script tags are not allowed in ' + label + '.');
    });

    // Achievement Icons (1-4)
    [['ach1Icon', 'Achievement 1 Icon'], ['ach2Icon', 'Achievement 2 Icon'], ['ach3Icon', 'Achievement 3 Icon'], ['ach4Icon', 'Achievement 4 Icon']].forEach(([key, label]) => {
        const v = sanitizeText(body[key]);
        if (!v) errors.push(label + ' is required.');
        else if (!isValidBootstrapIcon(v)) errors.push('Please enter a valid Bootstrap Icon class for ' + label + ' (e.g. bi-award-fill).');
    });

    return { valid: errors.length === 0, errors };
}

function sanitizeAboutBody(body) {
    const singleLine = ['introTitle', 'experienceYears', 'experienceLabel', 'achievementsHeading',
        'ach1Text', 'ach1Icon', 'ach2Text', 'ach2Icon', 'ach3Text', 'ach3Icon', 'ach4Text', 'ach4Icon'];
    const multiLine = ['introDesc', 'missionText', 'visionText', 'valuesText'];
    singleLine.forEach(f => { if (body[f] !== undefined) body[f] = sanitizeText(body[f]); });
    multiLine.forEach(f => { if (body[f] !== undefined) body[f] = sanitizeMultiline(body[f]); });
    return body;
}

// ────────────────────────────────────────────
//  GET /api/about — Fetch About page data
// ────────────────────────────────────────────
exports.getAbout = (req, res) => {
    try {
        const data = readAboutData();
        return res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Error reading About data:', error);
        return res.status(500).json({ success: false, message: 'Failed to load About page data.' });
    }
};

// ────────────────────────────────────────────
//  PUT /api/about — Update About page data
// ────────────────────────────────────────────
exports.updateAbout = (req, res) => {
    try {
        // Validate input
        const validation = validateAboutFields(req.body, req.file);
        if (!validation.valid) {
            // Clean up temp file if validation fails
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Sanitize
        sanitizeAboutBody(req.body);

        const {
            introTitle,
            introDesc,
            experienceYears,
            experienceLabel,
            missionText,
            visionText,
            valuesText,
            achievementsHeading,
            ach1Text,
            ach1Icon,
            ach2Text,
            ach2Icon,
            ach3Text,
            ach3Icon,
            ach4Text,
            ach4Icon
        } = req.body;

        const existingData = readAboutData();
        let aboutImage = existingData.aboutImage;

        // Handle uploaded aboutImage file
        if (req.file) {
            const ext = path.extname(req.file.originalname).toLowerCase();
            const filename = `about-construction-${Date.now()}${ext}`;
            const destPath = path.join(IMAGES_DIR, filename);

            // Ensure images directory exists
            if (!fs.existsSync(IMAGES_DIR)) {
                fs.mkdirSync(IMAGES_DIR, { recursive: true });
            }

            // Copy file from temp location to images folder
            fs.copyFileSync(req.file.path, destPath);
            fs.unlinkSync(req.file.path); // Remove temp file

            // Delete old uploaded image if it exists and is not the default one
            if (existingData.aboutImage && 
                existingData.aboutImage !== 'images/about-construction.png' && 
                !existingData.aboutImage.startsWith('http')) {
                
                const oldImagePath = path.join(FRONTEND_ROOT, existingData.aboutImage);
                if (fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                    } catch (err) {
                        console.error('⚠️ Could not delete old About image:', err.message);
                    }
                }
            }

            aboutImage = 'images/' + filename;
        }

        const updatedData = {
            introTitle: introTitle,
            introDesc: introDesc,
            aboutImage: aboutImage,
            experienceYears: experienceYears,
            experienceLabel: experienceLabel,
            missionText: missionText,
            visionText: visionText,
            valuesText: valuesText,
            achievementsHeading: achievementsHeading || existingData.achievementsHeading || "Certifications & Recognition",
            ach1Text: ach1Text || existingData.ach1Text || "",
            ach1Icon: ach1Icon || existingData.ach1Icon || "",
            ach2Text: ach2Text || existingData.ach2Text || "",
            ach2Icon: ach2Icon || existingData.ach2Icon || "",
            ach3Text: ach3Text || existingData.ach3Text || "",
            ach3Icon: ach3Icon || existingData.ach3Icon || "",
            ach4Text: ach4Text || existingData.ach4Text || "",
            ach4Icon: ach4Icon || existingData.ach4Icon || ""
        };

        writeAboutData(updatedData);

        return res.json({
            success: true,
            message: 'About page content updated successfully.',
            data: updatedData
        });

    } catch (error) {
        console.error('❌ Error updating About page content:', error);
        // Clean up temp file if error occurs after file upload
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ success: false, message: 'Failed to update About page content.' });
    }
};
