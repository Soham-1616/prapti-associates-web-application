// ═══════════════════════════════════════════
//  HOMEPAGE ROUTES
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const homepageController = require('../controllers/homepageController');

// Public route
router.get('/', homepageController.get);

// Protected route (Admin only)
router.put('/', requireAuth, homepageController.update);

module.exports = router;
