// ═══════════════════════════════════════════
//  ROUTES — Authentication
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// POST /api/auth/login — Admin login
router.post('/login', authController.login);

// GET /api/auth/verify — Verify token (protected)
router.get('/verify', requireAuth, authController.verify);

// GET /api/auth/me — Fetch active admin profile details (protected)
router.get('/me', requireAuth, authController.getAccountDetails);

// PUT /api/auth/username — Update admin username (protected)
router.put('/username', requireAuth, authController.updateUsername);

// PUT /api/auth/password — Change admin password (protected)
router.put('/password', requireAuth, authController.updatePassword);

module.exports = router;
