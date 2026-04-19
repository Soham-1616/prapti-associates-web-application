// ═══════════════════════════════════════════
//  APPOINTMENT & CONTACT CONTROLLERS
// ═══════════════════════════════════════════

const transporter = require('../config/emailConfig');
const fs = require('fs');
const path = require('path');

// Path to appointments data file
const APPOINTMENTS_FILE = path.join(__dirname, '..', 'data', 'appointments.json');

// ── Helper: Validate email format ──
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ── Helper: Read appointments data ──
function readAppointments() {
    try {
        const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// ── Helper: Write appointments data ──
function writeAppointments(data) {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Helper: Generate unique ID ──
function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
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

        // ── Generate unique ID and save appointment ──
        const appointmentId = generateId();
        const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

        const appointmentEntry = {
            id: appointmentId,
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone || '',
            serviceType: serviceType || 'General',
            preferredDate,
            preferredTime: preferredTime || 'Not specified',
            message: message || '',
            status: 'Pending',
            submittedAt: new Date().toISOString(),
        };

        // Save to JSON file
        const appointments = readAppointments();
        appointments.push(appointmentEntry);
        writeAppointments(appointments);

        // ── Approve / Reject links ──
        const approveLink = `${BASE_URL}/api/appointments/approve?id=${appointmentId}`;
        const rejectLink = `${BASE_URL}/api/appointments/reject?id=${appointmentId}`;

        // ── Build email content ──
        const emailHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: #0a1628; padding: 24px; text-align: center;">
                    <h1 style="color: #d4a437; margin: 0; font-size: 22px;">🏗️ New Appointment Request</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px;">ID: ${appointmentId}</p>
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

                    <!-- ── Approve / Reject Action Buttons ── -->
                    <div style="margin-top: 24px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <p style="margin: 0 0 16px; font-weight: 600; color: #333; font-size: 15px;">Take Action on this Appointment:</p>
                        <a href="${approveLink}" 
                           style="display: inline-block; padding: 12px 32px; background: #28a745; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 12px;">
                            ✅ Approve
                        </a>
                        <a href="${rejectLink}" 
                           style="display: inline-block; padding: 12px 32px; background: #dc3545; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                            ❌ Reject
                        </a>
                    </div>
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
//  GET /api/appointments/approve — Approve Appointment
// ────────────────────────────────────────────
exports.approveAppointment = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).send(buildResponseHTML('Error', 'No appointment ID provided.', '#dc3545'));
        }

        const appointments = readAppointments();
        const index = appointments.findIndex(a => a.id === id);

        if (index === -1) {
            return res.status(404).send(buildResponseHTML('Not Found', 'Appointment not found.', '#dc3545'));
        }

        if (appointments[index].status === 'Approved') {
            return res.send(buildResponseHTML('Already Approved', `This appointment for <strong>${appointments[index].fullName}</strong> has already been approved.`, '#17a2b8'));
        }

        if (appointments[index].status === 'Rejected') {
            return res.send(buildResponseHTML('Already Rejected', `This appointment for <strong>${appointments[index].fullName}</strong> was previously rejected.`, '#ffc107'));
        }

        // Update status
        appointments[index].status = 'Approved';
        appointments[index].actionAt = new Date().toISOString();
        writeAppointments(appointments);

        const appt = appointments[index];

        // ── Send approval email to customer ──
        await sendCustomerNotification(appt, 'Approved');

        return res.send(buildResponseHTML(
            'Appointment Approved ✅',
            `<strong>${appt.fullName}</strong>'s appointment for <strong>${appt.serviceType}</strong> on <strong>${appt.preferredDate}</strong> has been approved successfully.<br><br><small style="color: rgba(255,255,255,0.5);">A confirmation email has been sent to ${appt.email}</small>`,
            '#28a745'
        ));

    } catch (error) {
        console.error('❌ Approve error:', error);
        return res.status(500).send(buildResponseHTML('Error', 'Something went wrong. Please try again.', '#dc3545'));
    }
};

// ────────────────────────────────────────────
//  GET /api/appointments/reject — Reject Appointment
// ────────────────────────────────────────────
exports.rejectAppointment = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).send(buildResponseHTML('Error', 'No appointment ID provided.', '#dc3545'));
        }

        const appointments = readAppointments();
        const index = appointments.findIndex(a => a.id === id);

        if (index === -1) {
            return res.status(404).send(buildResponseHTML('Not Found', 'Appointment not found.', '#dc3545'));
        }

        if (appointments[index].status === 'Rejected') {
            return res.send(buildResponseHTML('Already Rejected', `This appointment for <strong>${appointments[index].fullName}</strong> has already been rejected.`, '#17a2b8'));
        }

        if (appointments[index].status === 'Approved') {
            return res.send(buildResponseHTML('Already Approved', `This appointment for <strong>${appointments[index].fullName}</strong> was previously approved.`, '#ffc107'));
        }

        // Update status
        appointments[index].status = 'Rejected';
        appointments[index].actionAt = new Date().toISOString();
        writeAppointments(appointments);

        const appt = appointments[index];

        // ── Send rejection email to customer ──
        await sendCustomerNotification(appt, 'Rejected');

        return res.send(buildResponseHTML(
            'Appointment Rejected ❌',
            `<strong>${appt.fullName}</strong>'s appointment for <strong>${appt.serviceType}</strong> on <strong>${appt.preferredDate}</strong> has been rejected.<br><br><small style="color: rgba(255,255,255,0.5);">A notification email has been sent to ${appt.email}</small>`,
            '#dc3545'
        ));

    } catch (error) {
        console.error('❌ Reject error:', error);
        return res.status(500).send(buildResponseHTML('Error', 'Something went wrong. Please try again.', '#dc3545'));
    }
};

// ═══════════════════════════════════════════
//  HELPER: Send email notification to customer
// ═══════════════════════════════════════════
async function sendCustomerNotification(appointment, status) {
    const isApproved = status === 'Approved';
    const accentColor = isApproved ? '#28a745' : '#dc3545';
    const statusIcon = isApproved ? '✅' : '❌';
    const statusMessage = isApproved
        ? 'We are pleased to inform you that your appointment has been <strong>approved</strong>. Our team will be ready to assist you on the scheduled date.'
        : 'We regret to inform you that your appointment has been <strong>declined</strong> at this time. Please feel free to book another appointment or contact us for assistance.';

    const emailHTML = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background: #0a1628; padding: 24px; text-align: center;">
                <h1 style="color: #d4a437; margin: 0; font-size: 22px;">🏗️ Prapti Associates</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px;">Appointment Update</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 48px;">${statusIcon}</span>
                    <h2 style="color: ${accentColor}; margin: 12px 0 0; font-size: 20px;">Appointment ${status}</h2>
                </div>
                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                    Dear <strong>${appointment.fullName}</strong>,
                </p>
                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                    ${statusMessage}
                </p>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 10px; font-weight: bold; color: #333; width: 40%;">Service</td>
                            <td style="padding: 8px 10px; color: #555;">${appointment.serviceType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 10px; font-weight: bold; color: #333;">Date</td>
                            <td style="padding: 8px 10px; color: #555;">${appointment.preferredDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 10px; font-weight: bold; color: #333;">Time</td>
                            <td style="padding: 8px 10px; color: #555;">${appointment.preferredTime}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 10px; font-weight: bold; color: #333;">Status</td>
                            <td style="padding: 8px 10px;">
                                <span style="display: inline-block; padding: 4px 12px; background: ${accentColor}; color: #fff; border-radius: 4px; font-size: 13px; font-weight: 600;">${status}</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <p style="color: #888; font-size: 13px; line-height: 1.6;">
                    If you have any questions, feel free to reply to this email or contact us at our office.
                </p>
            </div>
            <div style="background: #0a1628; padding: 16px; text-align: center;">
                <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">
                    © 2026 Prapti Associates — Construction Consultancy
                </p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Prapti Associates" <${process.env.EMAIL_USER}>`,
            to: appointment.email,
            subject: `Appointment ${status} — Prapti Associates`,
            html: emailHTML,
        });
        console.log(`📧 ${status} email sent to ${appointment.email}`);
    } catch (err) {
        console.error(`❌ Failed to send ${status} email to ${appointment.email}:`, err.message);
    }
}

// ────────────────────────────────────────────
//  GET /api/appointments — Get all appointments
// ────────────────────────────────────────────
exports.getAppointments = (req, res) => {
    try {
        const appointments = readAppointments();
        const sorted = appointments.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        return res.status(200).json({
            success: true,
            count: sorted.length,
            data: sorted,
        });
    } catch (error) {
        console.error('❌ Error fetching appointments:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not load appointments.',
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

// ═══════════════════════════════════════════
//  HELPER: Build styled HTML response page
// ═══════════════════════════════════════════
function buildResponseHTML(title, message, accentColor) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} — Prapti Associates</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Poppins', sans-serif;
                background: #0a1628;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .card {
                background: #111d32;
                border-radius: 16px;
                padding: 48px 40px;
                max-width: 500px;
                width: 100%;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            }
            .icon {
                width: 80px; height: 80px;
                border-radius: 50%;
                background: ${accentColor};
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 24px;
                font-size: 36px;
            }
            h1 {
                color: #ffffff;
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 16px;
            }
            p {
                color: rgba(255,255,255,0.7);
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 32px;
            }
            a {
                display: inline-block;
                padding: 12px 28px;
                background: #d4a437;
                color: #0a1628;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                transition: background 0.3s;
            }
            a:hover { background: #b8892e; }
            .brand {
                margin-top: 32px;
                color: rgba(255,255,255,0.3);
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">${title.includes('Approved') ? '✅' : title.includes('Rejected') ? '❌' : title.includes('Already') ? 'ℹ️' : '⚠️'}</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <a href="http://localhost:5500">← Back to Website</a>
            <div class="brand">Prapti Associates</div>
        </div>
    </body>
    </html>
    `;
}
