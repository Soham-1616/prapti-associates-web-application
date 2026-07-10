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

        // Validation
        if (!introTitle || !introTitle.trim()) {
            return res.status(400).json({ success: false, message: 'Introduction Title is required.' });
        }
        if (!introDesc || !introDesc.trim()) {
            return res.status(400).json({ success: false, message: 'Company Description is required.' });
        }
        if (!missionText || !missionText.trim()) {
            return res.status(400).json({ success: false, message: 'Mission Text is required.' });
        }
        if (!visionText || !visionText.trim()) {
            return res.status(400).json({ success: false, message: 'Vision Text is required.' });
        }

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
            introTitle: introTitle.trim(),
            introDesc: introDesc.trim(),
            aboutImage: aboutImage,
            experienceYears: experienceYears ? experienceYears.trim() : existingData.experienceYears,
            experienceLabel: experienceLabel ? experienceLabel.trim() : existingData.experienceLabel,
            missionText: missionText.trim(),
            visionText: visionText.trim(),
            valuesText: valuesText ? valuesText.trim() : existingData.valuesText,
            achievementsHeading: achievementsHeading ? achievementsHeading.trim() : (existingData.achievementsHeading || "Certifications & Recognition"),
            ach1Text: ach1Text ? ach1Text.trim() : (existingData.ach1Text || ""),
            ach1Icon: ach1Icon ? ach1Icon.trim() : (existingData.ach1Icon || ""),
            ach2Text: ach2Text ? ach2Text.trim() : (existingData.ach2Text || ""),
            ach2Icon: ach2Icon ? ach2Icon.trim() : (existingData.ach2Icon || ""),
            ach3Text: ach3Text ? ach3Text.trim() : (existingData.ach3Text || ""),
            ach3Icon: ach3Icon ? ach3Icon.trim() : (existingData.ach3Icon || ""),
            ach4Text: ach4Text ? ach4Text.trim() : (existingData.ach4Text || ""),
            ach4Icon: ach4Icon ? ach4Icon.trim() : (existingData.ach4Icon || "")
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
