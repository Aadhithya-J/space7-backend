const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');

let io;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Authentication middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) return next(new Error('Authentication required'));

            const decoded = verifyToken(token);
            socket.userId = decoded.user_id;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.userId}`);

        // Join a space room
        socket.on('join_space', (spaceId) => {
            socket.join(`space:${spaceId}`);
            console.log(`User ${socket.userId} joined space:${spaceId}`);
        });

        // Leave a space room
        socket.on('leave_space', (spaceId) => {
            socket.leave(`space:${spaceId}`);
            console.log(`User ${socket.userId} left space:${spaceId}`);
        });

        // Send a message (broadcast to space room)
        socket.on('send_message', (data) => {
            const { spaceId, message } = data;
            io.to(`space:${spaceId}`).emit('receive_message', {
                ...message,
                sender_id: socket.userId,
            });
        });

        // Message appreciated
        socket.on('message_appreciated', (data) => {
            const { spaceId, messageId, appreciated, userId } = data;
            io.to(`space:${spaceId}`).emit('message_appreciated', {
                messageId,
                appreciated,
                userId,
            });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.userId}`);
        });
    });

    return io;
}

function getIO() {
    if (!io) throw new Error('Socket.IO not initialised');
    return io;
}

module.exports = { initSocket, getIO };
