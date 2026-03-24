// ═══════════════════════════════════════════
//  CONSULTANCY CONTROLLER
// ═══════════════════════════════════════════

const transporter = require('../config/emailConfig');
const fs = require('fs');

// ── Helper: Validate email format ──
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ────────────────────────────────────────────
//  POST /api/consultancy — Submit Consultancy Request
// ────────────────────────────────────────────
exports.submitConsultancy = async (req, res) => {
    try {
        const {
            fullName, email, phone, companyName,
            projectType, siteLocation, estimatedArea,
            budgetRange, projectDescription,
        } = req.body;
        const documents = req.files; // multer array of files

        // ── Validation ──
        const errors = [];

        if (!fullName || fullName.trim() === '') {
            errors.push('Full Name is required.');
        }
        if (!email || email.trim() === '') {
            errors.push('Email is required.');
        } else if (!isValidEmail(email)) {
            errors.push('Please provide a valid email address.');
        }
        if (!phone || phone.trim() === '') {
            errors.push('Phone number is required.');
        }
        if (!projectType || projectType.trim() === '') {
            errors.push('Project Type is required.');
        }
        if (!siteLocation || siteLocation.trim() === '') {
            errors.push('Site Location is required.');
        }
        if (!projectDescription || projectDescription.trim() === '') {
            errors.push('Project Description is required.');
        }

        if (errors.length > 0) {
            // Clean up uploaded files if validation fails
            if (documents && documents.length > 0) {
                documents.forEach(file => fs.unlinkSync(file.path));
            }
            return res.status(400).json({
                success: false,
                message: 'Validation failed.',
                errors,
            });
        }

        // ── Build email content ──
        const emailHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: #0a1628; padding: 24px; text-align: center;">
                    <h1 style="color: #d4a437; margin: 0; font-size: 22px;">📋 New Consultancy Request</h1>
                </div>
                <div style="padding: 24px; background: #ffffff;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333; width: 35%;">Full Name</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${fullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Email</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;"><a href="mailto:${email}">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Phone</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Company</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${companyName || 'Not provided'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Project Type</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${projectType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Site Location</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${siteLocation}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Estimated Area</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${estimatedArea || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Budget Range</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${budgetRange || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; color: #333;">Project Description</td>
                            <td style="padding: 10px; color: #555;">${projectDescription}</td>
                        </tr>
                    </table>
                    ${documents && documents.length > 0
                        ? `<p style="padding: 10px; color: #888; font-size: 13px;">📎 ${documents.length} document(s) attached</p>`
                        : ''}
                </div>
                <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #888;">
                    Sent from Prapti Associates Website — Consultancy Form
                </div>
            </div>
        `;

        // ── Email options ──
        const mailOptions = {
            from: `"Prapti Associates Website" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `Consultancy Request: ${projectType} — ${fullName}`,
            html: emailHTML,
            replyTo: email,
        };

        // Attach documents if uploaded
        if (documents && documents.length > 0) {
            mailOptions.attachments = documents.map(file => ({
                filename: file.originalname,
                path: file.path,
            }));
        }

        // ── Send email ──
        await transporter.sendMail(mailOptions);

        // Clean up uploaded files after sending
        if (documents && documents.length > 0) {
            documents.forEach(file => {
                fs.unlink(file.path, () => {});
            });
        }

        // ── Success response ──
        return res.status(201).json({
            success: true,
            message: 'Consultancy request submitted successfully! Our team will contact you within 48 hours.',
        });

    } catch (error) {
        console.error('❌ Consultancy submission error:', error);
        // Clean up files on error
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                fs.unlink(file.path, () => {});
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while submitting your request. Please try again later.',
        });
    }
};
