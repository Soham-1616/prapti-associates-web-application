// ═══════════════════════════════════════════
//  ROUTES — Connections Management
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const connectionController = require('../controllers/connectionController');
const { uploadConnectionPhoto } = require('../config/uploadConfig');

// ── Public Routes ──
router.get('/', connectionController.getAll);
router.get('/:id', connectionController.getById);

// ── Protected Routes (Admin only) ──
router.post('/', requireAuth, uploadConnectionPhoto, connectionController.create);
router.put('/:id', requireAuth, uploadConnectionPhoto, connectionController.update);
router.delete('/:id', requireAuth, connectionController.remove);

module.exports = router;
