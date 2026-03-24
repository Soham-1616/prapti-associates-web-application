// ═══════════════════════════════════════════
//  APPOINTMENT & CONTACT CONTROLLERS
// ═══════════════════════════════════════════

const transporter = require('../config/emailConfig');

// ── Helper: Validate email format ──
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ────────────────────────────────────────────
//  POST /api/appointments — Book Appointment
// ────────────────────────────────────────────
exports.bookAppointment = async (req, res) => {
    try {
        const { fullName, email, phone, serviceType, preferredDate, preferredTime, message } = req.body;

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
        if (!preferredDate || preferredDate.trim() === '') {
            errors.push('Preferred Date is required.');
        }

        if (errors.length > 0) {
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
                    <h1 style="color: #d4a437; margin: 0; font-size: 22px;">🏗️ New Appointment Request</h1>
                </div>
                <div style="padding: 24px; background: #ffffff;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333; width: 40%;">Full Name</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${fullName}</td>
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
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Service Type</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${serviceType || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Preferred Date</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${preferredDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Preferred Time</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${preferredTime || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; color: #333;">Message</td>
                            <td style="padding: 10px; color: #555;">${message || 'No message provided'}</td>
                        </tr>
                    </table>
                </div>
                <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #888;">
                    Sent from Prapti Associates Website — Appointment Form
                </div>
            </div>
        `;

        // ── Send email ──
        await transporter.sendMail({
            from: `"Prapti Associates Website" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New Appointment: ${fullName} — ${serviceType || 'General'}`,
            html: emailHTML,
            replyTo: email,
        });

        // ── Success response ──
        return res.status(201).json({
            success: true,
            message: 'Appointment booked successfully! We will contact you within 24 hours.',
        });

    } catch (error) {
        console.error('❌ Appointment booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while booking your appointment. Please try again later.',
        });
    }
};

// ────────────────────────────────────────────
//  POST /api/contact — Contact Form
// ────────────────────────────────────────────
exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // ── Validation ──
        const errors = [];

        if (!name || name.trim() === '') {
            errors.push('Name is required.');
        }
        if (!email || email.trim() === '') {
            errors.push('Email is required.');
        } else if (!isValidEmail(email)) {
            errors.push('Please provide a valid email address.');
        }
        if (!subject || subject.trim() === '') {
            errors.push('Subject is required.');
        }
        if (!message || message.trim() === '') {
            errors.push('Message is required.');
        }

        if (errors.length > 0) {
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
                    <h1 style="color: #d4a437; margin: 0; font-size: 22px;">📩 New Contact Message</h1>
                </div>
                <div style="padding: 24px; background: #ffffff;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333; width: 30%;">Name</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${name}</td>
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
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Subject</td>
                            <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${subject}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; color: #333;">Message</td>
                            <td style="padding: 10px; color: #555;">${message}</td>
                        </tr>
                    </table>
                </div>
                <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #888;">
                    Sent from Prapti Associates Website — Contact Form
                </div>
            </div>
        `;

        // ── Send email ──
        await transporter.sendMail({
            from: `"Prapti Associates Website" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `Contact: ${subject} — from ${name}`,
            html: emailHTML,
            replyTo: email,
        });

        // ── Success response ──
        return res.status(201).json({
            success: true,
            message: 'Message sent successfully! We will get back to you soon.',
        });

    } catch (error) {
        console.error('❌ Contact form error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while sending your message. Please try again later.',
        });
    }
};
