// ═══════════════════════════════════════════
//  ROUTES — Consultancy
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { uploadConsultancyDocs } = require('../config/uploadConfig');
const consultancyController = require('../controllers/consultancyController');

// POST /api/consultancy — Submit consultancy request (with optional documents)
router.post('/consultancy', (req, res, next) => {
    uploadConsultancyDocs(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error.',
            });
        }
        next();
    });
}, consultancyController.submitConsultancy);

module.exports = router;
