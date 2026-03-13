const { Worker } = require('bullmq');
const { bullConnection } = require('../config/redis');
const { Notification } = require('../models');

const notificationWorker = new Worker(
    'notifications',
    async (job) => {
        const { user_id, type, reference_id, message } = job.data;

        await Notification.create({
            user_id,
            type,
            reference_id,
            message: message || '',
            is_read: false,
        });

        console.log(`📬 Notification created for user ${user_id}: ${type}`);
    },
    { connection: bullConnection }
);

notificationWorker.on('failed', (job, err) => {
    console.error(`Notification job ${job.id} failed:`, err.message);
});

module.exports = notificationWorker;
