// ═══════════════════════════════════════════
//  UPLOAD CONFIG — Multer File Upload Setup
// ═══════════════════════════════════════════

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});

// File filter — images only (for feedback photo, projects, and connections)
const imageFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.'), false);
    }
};

// File filter — documents + images (for consultancy)
const documentFilter = (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, and WEBP files are allowed.'), false);
    }
};

// Multer instances
const uploadFeedbackPhoto = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('photo');

const uploadConsultancyDocs = multer({
    storage,
    fileFilter: documentFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
}).array('documents', 5); // max 5 files

// Project images upload (hero + gallery)
const uploadProjectImages = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
}).fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
]);

// Connection profile image upload (single photo)
const uploadConnectionPhoto = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('photo');

// About section image upload (single photo)
const uploadAboutPhoto = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('aboutImage');

module.exports = { 
    uploadFeedbackPhoto, 
    uploadConsultancyDocs, 
    uploadProjectImages,
    uploadConnectionPhoto,
    uploadAboutPhoto
};
