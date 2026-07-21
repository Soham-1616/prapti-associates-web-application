// ═══════════════════════════════════════════
//  HOMEPAGE CONTROLLER — Read & Update
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'homepage.json');

// Helper: Read/Write JSON
function readHomepage() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '{}', 'utf-8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeHomepage(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), 'utf-8');
}

// ── Validation Helpers ──
function sanitizeText(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ');
}

function containsMaliciousContent(str) {
    if (!str) return false;
    return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
}

function isValidLink(link) {
    if (!link) return false;
    // Allow relative paths (e.g. appointment.html, /about)
    if (/^[a-zA-Z0-9_.\-/#?=&%]+$/.test(link)) return true;
    // Allow absolute https URLs
    if (/^https:\/\/.+/.test(link)) return true;
    return false;
}

function isValidStatNumber(val) {
    if (!val) return false;
    // Allow: 50, 125+, 98%, 12+, 150+
    return /^\d+[+%]?$/.test(val.trim());
}

function validateHomepageFields(body) {
    const errors = [];
    const {
        heroBadge, heroHeadingLine1, heroHeadingLine2, heroDescription,
        primaryBtnText, primaryBtnLink, secondaryBtnText, secondaryBtnLink,
        stat1Number, stat1Label, stat2Number, stat2Label, stat3Number, stat3Label
    } = body;

    // Badge (optional)
    if (heroBadge !== undefined && sanitizeText(heroBadge)) {
        const b = sanitizeText(heroBadge);
        if (b.length < 3) errors.push('Badge Text must be at least 3 characters.');
        else if (b.length > 50) errors.push('Badge Text cannot exceed 50 characters.');
        else if (containsMaliciousContent(heroBadge)) errors.push('HTML or script tags are not allowed in Badge Text.');
    }

    // Heading Line 1
    const h1 = sanitizeText(heroHeadingLine1);
    if (!h1) errors.push('Heading Line 1 is required.');
    else if (h1.length < 5) errors.push('Heading Line 1 must be at least 5 characters.');
    else if (h1.length > 80) errors.push('Heading Line 1 cannot exceed 80 characters.');
    else if (containsMaliciousContent(heroHeadingLine1)) errors.push('HTML or script tags are not allowed in Heading Line 1.');

    // Heading Line 2
    const h2 = sanitizeText(heroHeadingLine2);
    if (!h2) errors.push('Heading Line 2 is required.');
    else if (h2.length < 5) errors.push('Heading Line 2 must be at least 5 characters.');
    else if (h2.length > 80) errors.push('Heading Line 2 cannot exceed 80 characters.');
    else if (containsMaliciousContent(heroHeadingLine2)) errors.push('HTML or script tags are not allowed in Heading Line 2.');

    // Description
    const desc = sanitizeText(heroDescription);
    if (!desc) errors.push('Description is required.');
    else if (desc.length < 30) errors.push('Description must be at least 30 characters.');
    else if (desc.length > 500) errors.push('Description cannot exceed 500 characters.');
    else if (containsMaliciousContent(heroDescription)) errors.push('HTML or script tags are not allowed in Description.');

    // Primary Button Text
    const pbt = sanitizeText(primaryBtnText);
    if (!pbt) errors.push('Primary Button Text is required.');
    else if (pbt.length < 2) errors.push('Primary Button Text must be at least 2 characters.');
    else if (pbt.length > 30) errors.push('Primary Button Text cannot exceed 30 characters.');
    else if (containsMaliciousContent(primaryBtnText)) errors.push('HTML or script tags are not allowed in Primary Button Text.');

    // Primary Button Link
    const pbl = sanitizeText(primaryBtnLink);
    if (!pbl) errors.push('Primary Button Link is required.');
    else if (!isValidLink(pbl)) errors.push('Please enter a valid page link for Primary Button.');
    else if (containsMaliciousContent(primaryBtnLink)) errors.push('HTML or script tags are not allowed in Primary Button Link.');

    // Secondary Button Text
    const sbt = sanitizeText(secondaryBtnText);
    if (!sbt) errors.push('Secondary Button Text is required.');
    else if (sbt.length < 2) errors.push('Secondary Button Text must be at least 2 characters.');
    else if (sbt.length > 30) errors.push('Secondary Button Text cannot exceed 30 characters.');
    else if (containsMaliciousContent(secondaryBtnText)) errors.push('HTML or script tags are not allowed in Secondary Button Text.');

    // Secondary Button Link
    const sbl = sanitizeText(secondaryBtnLink);
    if (!sbl) errors.push('Secondary Button Link is required.');
    else if (!isValidLink(sbl)) errors.push('Please enter a valid page link for Secondary Button.');
    else if (containsMaliciousContent(secondaryBtnLink)) errors.push('HTML or script tags are not allowed in Secondary Button Link.');

    // Statistics
    [['stat1Number', stat1Number, 'Stat 1 Number'], ['stat2Number', stat2Number, 'Stat 2 Number'], ['stat3Number', stat3Number, 'Stat 3 Number']].forEach(([, val, label]) => {
        const v = sanitizeText(val);
        if (!v) errors.push(label + ' is required.');
        else if (!isValidStatNumber(v)) errors.push(label + ' must be a positive number, e.g. 50, 98%, 12+');
    });

    [['stat1Label', stat1Label, 'Stat 1 Label'], ['stat2Label', stat2Label, 'Stat 2 Label'], ['stat3Label', stat3Label, 'Stat 3 Label']].forEach(([, val, label]) => {
        const v = sanitizeText(val);
        if (!v) errors.push(label + ' is required.');
        else if (v.length < 3) errors.push(label + ' must be at least 3 characters.');
        else if (v.length > 40) errors.push(label + ' cannot exceed 40 characters.');
        else if (containsMaliciousContent(val)) errors.push('HTML or script tags are not allowed in ' + label + '.');
    });

    return { valid: errors.length === 0, errors };
}

function sanitizeHomepageBody(body) {
    const fields = ['heroBadge','heroHeadingLine1','heroHeadingLine2','heroDescription',
        'primaryBtnText','primaryBtnLink','secondaryBtnText','secondaryBtnLink',
        'stat1Number','stat1Label','stat2Number','stat2Label','stat3Number','stat3Label'];
    fields.forEach(f => { if (body[f] !== undefined) body[f] = sanitizeText(body[f]); });
    return body;
}

// ────────────────────────────────────────────
//  GET /api/homepage — Get homepage content
// ────────────────────────────────────────────
exports.get = (req, res) => {
    try {
        const data = readHomepage();
        return res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Error reading homepage data:', error);
        return res.status(500).json({ success: false, message: 'Failed to load homepage data.' });
    }
};

// ────────────────────────────────────────────
//  PUT /api/homepage — Update homepage content
// ────────────────────────────────────────────
exports.update = (req, res) => {
    try {
        const {
            heroBadge,
            heroHeadingLine1,
            heroHeadingLine2,
            heroDescription,
            primaryBtnText,
            primaryBtnLink,
            secondaryBtnText,
            secondaryBtnLink,
            stat1Number,
            stat1Label,
            stat2Number,
            stat2Label,
            stat3Number,
            stat3Label
        } = req.body;

        // Validate input
        const validation = validateHomepageFields(req.body);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Sanitize
        sanitizeHomepageBody(req.body);

        const {
            heroBadge: sHeroBadge,
            heroHeadingLine1: sLine1,
            heroHeadingLine2: sLine2,
            heroDescription: sDesc,
            primaryBtnText: sPBT,
            primaryBtnLink: sPBL,
            secondaryBtnText: sSBT,
            secondaryBtnLink: sSBL,
            stat1Number: sS1N, stat1Label: sS1L,
            stat2Number: sS2N, stat2Label: sS2L,
            stat3Number: sS3N, stat3Label: sS3L
        } = req.body;

        const existing = readHomepage();

        const updated = {
            heroBadge:         sHeroBadge !== undefined ? sHeroBadge : existing.heroBadge,
            heroHeadingLine1:  sLine1,
            heroHeadingLine2:  sLine2,
            heroDescription:   sDesc,
            primaryBtnText:    sPBT,
            primaryBtnLink:    sPBL,
            secondaryBtnText:  sSBT,
            secondaryBtnLink:  sSBL,
            stat1Number: sS1N, stat1Label: sS1L,
            stat2Number: sS2N, stat2Label: sS2L,
            stat3Number: sS3N, stat3Label: sS3L
        };

        writeHomepage(updated);

        return res.json({ success: true, message: 'Homepage updated successfully.', data: updated });

    } catch (error) {
        console.error('❌ Error updating homepage:', error);
        return res.status(500).json({ success: false, message: 'Failed to update homepage.' });
    }
};
