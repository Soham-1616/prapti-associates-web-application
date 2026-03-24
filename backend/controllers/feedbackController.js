// ═══════════════════════════════════════════
//  FEEDBACK CONTROLLER
// ═══════════════════════════════════════════

const transporter = require('../config/emailConfig');
const fs = require('fs');
const path = require('path');

// Path to feedback data file
const FEEDBACK_FILE = path.join(__dirname, '..', 'data', 'feedback.json');

// ── Helper: Read feedback data ──
function readFeedbackData() {
    try {
        const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// ── Helper: Write feedback data ──
function writeFeedbackData(data) {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Helper: Validate email format ──
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ── Star rating to text ──
function ratingToText(rating) {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[rating] || 'Unknown';
}

// ── Star rating to stars HTML ──
function ratingToStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return stars;
}

// ────────────────────────────────────────────
//  GET /api/feedback — Get all feedback
// ────────────────────────────────────────────
exports.getFeedback = (req, res) => {
    try {
        const feedbackList = readFeedbackData();
        // Return in reverse chronological order (newest first)
        const sorted = feedbackList.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        return res.status(200).json({
            success: true,
            count: sorted.length,
            data: sorted,
        });
    } catch (error) {
        console.error('❌ Error fetching feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not load feedback.',
        });
    }
};

// ────────────────────────────────────────────
//  POST /api/feedback — Submit Feedback
// ────────────────────────────────────────────
exports.submitFeedback = async (req, res) => {
    try {
        const { clientName, email, phone, projectAssociated, rating, feedback } = req.body;
        const photo = req.file; // multer single file

        // ── Validation ──
        const errors = [];

        if (!clientName || clientName.trim() === '') {
            errors.push('Name is required.');
        }
        if (!email || email.trim() === '') {
            errors.push('Email is required.');
        } else if (!isValidEmail(email)) {
            errors.push('Please provide a valid email address.');
        }
        if (!rating || parseInt(rating) < 1 || parseInt(rating) > 5) {
            errors.push('A valid rating (1-5) is required.');
        }
        if (!feedback || feedback.trim() === '') {
            errors.push('Feedback message is required.');
        }

        if (errors.length > 0) {
            // Clean up uploaded file if validation fails
            if (photo) fs.unlinkSync(photo.path);
            return res.status(400).json({
                success: false,
                message: 'Validation failed.',
                errors,
            });
        }

        const ratingNum = parseInt(rating);

        // ── Save to JSON file ──
        const feedbackEntry = {
            id: Date.now().toString(),
            clientName: clientName.trim(),
            email: email.trim(),
            phone: phone || '',
            projectAssociated: projectAssociated || '',
            rating: ratingNum,
            feedback: feedback.trim(),
            submittedAt: new Date().toISOString(),
        };

        const feedbackList = readFeedbackData();
        feedbackList.push(feedbackEntry);
        writeFeedbackData(feedbackList);

        // ── Build email content ──
        const emailHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: #0a1628; padding: 24px; text-align: center;">
                    <h1 style="color: #d4a437; margin: 0; font-size: 22px;">⭐ New Customer Feedback</h1>
                </div>
                <div style="padding: 24px; background: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 32px; color: #d4a437;">${ratingToStars(ratingNum)}</span>
                        <br><strong style="color: #333;">${ratingToText(ratingNum)} (${ratingNum}/5)</strong>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333; width: 35%;">Client Name</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${clientName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Email</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;"><a href="mailto:${email}">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Phone</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${phone || 'Not provided'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Project</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${projectAssociated || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; color: #333;">Feedback</td>
                            <td style="padding: 10px; color: #555;">${feedback}</td>
                        </tr>
                    </table>
                    ${photo ? '<p style="padding: 10px; color: #888; font-size: 13px;">📎 Photo attached below</p>' : ''}
                </div>
                <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #888;">
                    Sent from Prapti Associates Website — Feedback Form
                </div>
            </div>
        `;

        // ── Email options ──
        const mailOptions = {
            from: `"Prapti Associates Website" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `Feedback: ${ratingToText(ratingNum)} (${ratingNum}★) — ${clientName}`,
            html: emailHTML,
            replyTo: email,
        };

        // Attach photo if uploaded
        if (photo) {
            mailOptions.attachments = [{
                filename: photo.originalname,
                path: photo.path,
            }];
        }

        // ── Send email ──
        await transporter.sendMail(mailOptions);

        // Clean up uploaded file after sending
        if (photo) {
            fs.unlink(photo.path, () => {});
        }

        // ── Success response ──
        return res.status(201).json({
            success: true,
            message: 'Thank you! Your feedback has been submitted successfully.',
            feedback: feedbackEntry, // Return the saved entry so frontend can display it immediately
        });

    } catch (error) {
        console.error('❌ Feedback submission error:', error);
        // Clean up file on error
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while submitting your feedback. Please try again later.',
        });
    }
};
