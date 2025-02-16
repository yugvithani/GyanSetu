const { Server } = require('socket.io');
const { sendMessage } = require('./controllers/chatController');

const activeUsers = new Map();

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('joinGroup', ({ groupId, userId }) => {
            socket.join(groupId);
            activeUsers.set(userId, socket.id);
            console.log(`User ${userId} joined group ${groupId}`);
        });

        socket.on('sendMessage', async ({ groupId, senderId, content }) => {
            const req = { params: { groupId }, body: { content }, user: { id: senderId } };
            const res = {
                status: () => res,
                json: (message) => io.to(groupId).emit('receiveMessage', message)
            };
            await sendMessage(req, res);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            activeUsers.forEach((value, key) => {
                if (value === socket.id) activeUsers.delete(key);
            });
        });
    });

    console.log('Socket.io initialized');
}

module.exports = { initializeSocket };
