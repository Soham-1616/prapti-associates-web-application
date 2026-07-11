// ═══════════════════════════════════════════
//  EMAIL CONFIG — Resend HTTP Email API
//  (Replaces Nodemailer SMTP which is blocked on Render free tier)
// ═══════════════════════════════════════════

const { Resend } = require('resend');
const fs = require('fs');

const resend = new Resend(process.env.RESEND_API_KEY);

// On Resend free tier, emails must be sent from onboarding@resend.dev
// To use your own domain (e.g. noreply@praptiassociates.com), verify it in the Resend dashboard
const FROM_ADDRESS = 'Prapti Associates <onboarding@resend.dev>';

// ── Fire-and-forget email sender ──
// Called without await in controllers so it never blocks the API response
async function sendMailAsync(mailOptions) {
    try {
        // Convert Nodemailer-style attachments to Resend format (Buffer instead of file path)
        let attachments;
        if (mailOptions.attachments && mailOptions.attachments.length > 0) {
            attachments = mailOptions.attachments
                .filter(att => att.path && fs.existsSync(att.path))
                .map(att => ({
                    filename: att.filename,
                    content: fs.readFileSync(att.path),
                }));
        }

        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
            subject: mailOptions.subject || 'Prapti Associates Notification',
            html: mailOptions.html,
            replyTo: mailOptions.replyTo || undefined,
            attachments: attachments && attachments.length > 0 ? attachments : undefined,
        });

        if (error) {
            console.warn(`⚠️ Resend email failed:`, error);
        } else {
            console.log(`📧 Email sent via Resend: "${mailOptions.subject}" (ID: ${data.id})`);
        }
    } catch (err) {
        console.warn(`⚠️ Resend email error (non-blocking): ${err.message}`);
    }
}

// Startup check
console.log(process.env.RESEND_API_KEY ? '✅ Resend API key configured — email notifications enabled' : '⚠️ RESEND_API_KEY not set — email notifications will be skipped');

module.exports = { sendMailAsync };
