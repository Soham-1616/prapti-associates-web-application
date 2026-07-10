// ═══════════════════════════════════════════
//  SERVICE ROUTES
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const serviceController = require('../controllers/serviceController');

// Public routes
router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);

// Protected routes (Admin only)
router.post('/', requireAuth, serviceController.create);
router.put('/:id', requireAuth, serviceController.update);
router.delete('/:id', requireAuth, serviceController.remove);

module.exports = router;
