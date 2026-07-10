// ═══════════════════════════════════════════
//  EMAIL CONFIG — Nodemailer Gmail SMTP Setup
// ═══════════════════════════════════════════

const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports (587)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false // Avoid blockages on Render/cloud hosting
    }
});

// Verify connection on startup (logs to console)
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email config error:', error.message);
        console.error('   Make sure EMAIL_USER and EMAIL_PASS are set correctly in .env');
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

module.exports = transporter;
