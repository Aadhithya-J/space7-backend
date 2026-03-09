const { Queue } = require('bullmq');
const redis = require('../config/redis');

const emailQueue = new Queue('emails', { connection: redis });

module.exports = emailQueue;
