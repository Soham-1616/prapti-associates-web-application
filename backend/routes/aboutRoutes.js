// ═══════════════════════════════════════════
//  ABOUT ROUTER — CMS API Endpoints
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const aboutController = require('../controllers/aboutController');
const { uploadAboutPhoto } = require('../config/uploadConfig');

// Public route
router.get('/', aboutController.getAbout);

// Protected route (Admin only)
router.put('/', requireAuth, uploadAboutPhoto, aboutController.updateAbout);

module.exports = router;
// 
