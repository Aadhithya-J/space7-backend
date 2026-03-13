const nodemailer = require('nodemailer');

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true'; // Brevo uses false for 587

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure, // false for port 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
});

/**
 * Send an email.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
async function sendEmail(to, subject, html) {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Space7" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent:", info.messageId);
    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
}

module.exports = sendEmail;