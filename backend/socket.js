const { Server } = require('socket.io');
const { sendMessage } = require('./controllers/chatController');

const activeUsers = new Map(); // Maps userId -> socketId

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
            if (!groupId || !userId) return;
            console.log(`User ${userId} joined group ${groupId}`);

            // Disconnect previous socket if the user is already connected
            if (activeUsers.has(userId)) {
                const oldSocketId = activeUsers.get(userId);
                if (oldSocketId !== socket.id) {
                    io.sockets.sockets.get(oldSocketId)?.disconnect(true);
                }
            }

            // Store the new socket ID
            activeUsers.set(userId, socket.id);
            socket.join(groupId);
        });

        socket.on("sendMessage", async ({ groupId, senderId, content, senderName }) => {
            if (!groupId || !senderId || !content || !senderName) return;
            console.log("Received sendMessage event:", { groupId, senderId, senderName, content });

            try {
                const req = { params: { groupId }, body: { content }, user: { id: senderId } };
                const res = {
                    status: () => res,
                    json: (message) => {
                        const messageWithSender = { ...message, senderId, senderName };
                        io.to(groupId).emit("receiveMessage", messageWithSender);
                        socket.emit("messageSent", messageWithSender);
                    }
                };
                await sendMessage(req, res);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            for (const [userId, sockId] of activeUsers.entries()) {
                if (sockId === socket.id) {
                    activeUsers.delete(userId);
                    break;
                }
            }
        });
    });

    console.log('Socket.io initialized');
}

module.exports = { initializeSocket };
