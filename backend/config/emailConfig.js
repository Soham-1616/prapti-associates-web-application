// ═══════════════════════════════════════════
//  EMAIL CONFIG — Brevo (formerly Sendinblue) HTTP API
//  Sends to ANY recipient email — no sandbox restrictions
//  Free tier: 300 emails/day
// ═══════════════════════════════════════════

const https = require('https');
const fs = require('fs');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'patilsoham1616@gmail.com';
const SENDER_NAME = 'Prapti Associates';

// ── Fire-and-forget email sender ──
// Called without await in controllers so it never blocks the API response
function sendMailAsync(mailOptions) {
    if (!BREVO_API_KEY) {
        console.warn('⚠️ BREVO_API_KEY not set — email skipped');
        return;
    }

    // Build Brevo API payload
    const emailPayload = {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: Array.isArray(mailOptions.to) ? mailOptions.to[0] : mailOptions.to }],
        subject: mailOptions.subject || 'Prapti Associates Notification',
        htmlContent: mailOptions.html,
    };

    // Add replyTo if provided
    if (mailOptions.replyTo) {
        emailPayload.replyTo = { email: mailOptions.replyTo };
    }

    // Convert file-path attachments to base64 for Brevo
    if (mailOptions.attachments && mailOptions.attachments.length > 0) {
        emailPayload.attachment = mailOptions.attachments
            .filter(att => att.path && fs.existsSync(att.path))
            .map(att => ({
                name: att.filename,
                content: fs.readFileSync(att.path).toString('base64'),
            }));
    }

    const payload = JSON.stringify(emailPayload);

    const options = {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
        },
    };

    // Send via HTTPS (non-blocking, fire-and-forget)
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const parsed = JSON.parse(data);
                    console.log(`📧 Email sent via Brevo: "${mailOptions.subject}" (ID: ${parsed.messageId})`);
                } catch (e) {
                    console.log(`📧 Email sent via Brevo: "${mailOptions.subject}"`);
                }
            } else {
                console.warn(`⚠️ Brevo email failed (${res.statusCode}):`, data);
            }
        });
    });

    req.on('error', (err) => {
        console.warn(`⚠️ Brevo email error (non-blocking): ${err.message}`);
    });

    req.write(payload);
    req.end();
}

// Startup check
console.log(BREVO_API_KEY ? '✅ Brevo API key configured — email notifications enabled' : '⚠️ BREVO_API_KEY not set — email notifications will be skipped');

module.exports = { sendMailAsync };
