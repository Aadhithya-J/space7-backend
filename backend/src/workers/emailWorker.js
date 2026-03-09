const { Worker } = require('bullmq');
const redis = require('../config/redis');
const sendEmail = require('../utils/sendEmail');

const emailWorker = new Worker(
    'emails',
    async (job) => {
        const { to, subject, html } = job.data;
        await sendEmail(to, subject, html);
        console.log(`📧 Email sent to ${to}: ${subject}`);
    },
    { connection: redis }
);

emailWorker.on('failed', (job, err) => {
    console.error(`Email job ${job.id} failed:`, err.message);
});

module.exports = emailWorker;
