const http = require('http');
const app = require('./app');
const sequelize = require('./config/database');
const { initSocket } = require('./sockets/socketServer');

// Import workers so they start processing
require('./workers/notificationWorker');
require('./workers/emailWorker');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Attach Socket.IO
initSocket(server);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected');

        // Try alter sync first; fall back to basic sync if alter fails
        try {
            await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
            console.log('✅ Database synced (alter)');
        } catch (syncErr) {
            console.warn('⚠️ ALTER sync failed, falling back to basic sync:', syncErr.message);
            await sequelize.sync();
            console.log('✅ Database synced (basic)');
        }

        server.listen(PORT, () => {
            console.log(`🚀 space7 backend running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
})();
