// ═══════════════════════════════════════════
//  EMAIL CONFIG — Nodemailer Gmail SMTP Setup
// ═══════════════════════════════════════════

const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
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
