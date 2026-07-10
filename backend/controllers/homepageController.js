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

        // Validation
        if (!heroHeadingLine1 || !heroHeadingLine1.trim()) {
            return res.status(400).json({ success: false, message: 'Hero Heading Line 1 is required.' });
        }
        if (!heroHeadingLine2 || !heroHeadingLine2.trim()) {
            return res.status(400).json({ success: false, message: 'Hero Heading Line 2 is required.' });
        }
        if (!heroDescription || !heroDescription.trim()) {
            return res.status(400).json({ success: false, message: 'Hero Description is required.' });
        }

        const existing = readHomepage();

        const updated = {
            heroBadge: heroBadge !== undefined ? heroBadge.trim() : existing.heroBadge,
            heroHeadingLine1: heroHeadingLine1.trim(),
            heroHeadingLine2: heroHeadingLine2.trim(),
            heroDescription: heroDescription.trim(),
            primaryBtnText: primaryBtnText !== undefined ? primaryBtnText.trim() : existing.primaryBtnText,
            primaryBtnLink: primaryBtnLink !== undefined ? primaryBtnLink.trim() : existing.primaryBtnLink,
            secondaryBtnText: secondaryBtnText !== undefined ? secondaryBtnText.trim() : existing.secondaryBtnText,
            secondaryBtnLink: secondaryBtnLink !== undefined ? secondaryBtnLink.trim() : existing.secondaryBtnLink,
            stat1Number: stat1Number !== undefined ? stat1Number.trim() : existing.stat1Number,
            stat1Label: stat1Label !== undefined ? stat1Label.trim() : existing.stat1Label,
            stat2Number: stat2Number !== undefined ? stat2Number.trim() : existing.stat2Number,
            stat2Label: stat2Label !== undefined ? stat2Label.trim() : existing.stat2Label,
            stat3Number: stat3Number !== undefined ? stat3Number.trim() : existing.stat3Number,
            stat3Label: stat3Label !== undefined ? stat3Label.trim() : existing.stat3Label
        };

        writeHomepage(updated);

        return res.json({ success: true, message: 'Homepage updated successfully.', data: updated });

    } catch (error) {
        console.error('❌ Error updating homepage:', error);
        return res.status(500).json({ success: false, message: 'Failed to update homepage.' });
    }
};
