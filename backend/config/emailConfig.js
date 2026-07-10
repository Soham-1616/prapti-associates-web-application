// ═══════════════════════════════════════════
//  EMAIL CONFIG — Nodemailer Gmail SMTP Setup
// ═══════════════════════════════════════════

const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 5000,  // 5s to establish connection (fail fast)
    greetingTimeout: 5000,    // 5s for SMTP greeting
    socketTimeout: 10000      // 10s for socket inactivity
});

// Verify connection on startup (non-blocking, just logs)
transporter.verify((error, success) => {
    if (error) {
        console.warn('⚠️ Email SMTP unavailable:', error.message);
        console.warn('   Email notifications will be skipped. Forms will still work.');
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Helper: send email without blocking the caller (fire-and-forget)
function sendMailAsync(mailOptions) {
    transporter.sendMail(mailOptions)
        .then(() => {
            console.log(`📧 Email sent: ${mailOptions.subject}`);
        })
        .catch((err) => {
            console.warn(`⚠️ Email failed (non-blocking): ${err.message}`);
        });
}

module.exports = { transporter, sendMailAsync };
