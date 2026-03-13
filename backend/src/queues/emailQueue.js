const { Queue } = require('bullmq');
const { bullConnection } = require('../config/redis');

const emailQueue = new Queue('emails', { connection: bullConnection });

module.exports = emailQueue;
