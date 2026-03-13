const Brevo = require('@getbrevo/brevo');

const transactionalEmailsApi = new Brevo.TransactionalEmailsApi();

transactionalEmailsApi.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

function parseSender() {
    const configuredSender = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM;

    if (!configuredSender) {
        throw new Error('BREVO_SENDER_EMAIL is required');
    }

    const match = configuredSender.match(/^(.*)<(.+)>$/);

    if (match) {
        return {
            name: match[1].trim().replace(/^"|"$/g, '') || 'Space7',
            email: match[2].trim(),
        };
    }

    return {
        name: process.env.BREVO_SENDER_NAME || 'Space7',
        email: configuredSender.trim(),
    };
}

/**
 * Send an email.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
async function sendEmail(to, subject, html) {
    const sender = parseSender();

    try {
        await transactionalEmailsApi.sendTransacEmail({
            sender,
            to: [{ email: to }],
            subject,
            html,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        const details = error.response?.body || error.message || error;
        console.error('Email sending failed:', details);
        throw error;
    }
}

module.exports = sendEmail;
