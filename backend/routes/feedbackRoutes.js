// ═══════════════════════════════════════════
//  ROUTES — Feedback
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { uploadFeedbackPhoto } = require('../config/uploadConfig');
const feedbackController = require('../controllers/feedbackController');

// GET /api/feedback — Get all submitted feedback
router.get('/feedback', feedbackController.getFeedback);

// POST /api/feedback — Submit customer feedback (with optional photo)
router.post('/feedback', (req, res, next) => {
    uploadFeedbackPhoto(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error.',
            });
        }
        next();
    });
}, feedbackController.submitFeedback);

module.exports = router;
