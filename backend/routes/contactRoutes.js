// ═══════════════════════════════════════════
//  CONTACT ROUTER — CMS API Endpoints
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const contactController = require('../controllers/contactController');

// Public route
router.get('/', contactController.getContact);

// Protected route (Admin only)
router.put('/', requireAuth, contactController.updateContact);

module.exports = router;
