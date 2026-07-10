// ═══════════════════════════════════════════
//  ROUTES — Project Management
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');
const { uploadProjectImages } = require('../config/uploadConfig');

// ── Public Routes ──
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);

// ── Protected Routes (Admin only) ──
router.post('/', requireAuth, uploadProjectImages, projectController.create);
router.put('/:id', requireAuth, uploadProjectImages, projectController.update);
router.delete('/:id', requireAuth, projectController.remove);

module.exports = router;
