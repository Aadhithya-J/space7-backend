const { Queue } = require('bullmq');
const { bullConnection } = require('../config/redis');

const notificationQueue = new Queue('notifications', { connection: bullConnection });

module.exports = notificationQueue;
