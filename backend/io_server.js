const { Server } = require('socket.io');

function configureSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*', // Allow all origins; customize for production
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join room
        socket.on('join-room', ({ roomId, peerId }) => {
            console.log(`${peerId} joined room: ${roomId}`);
            socket.join(roomId);
            socket.to(roomId).emit('new-peer', { peerId });
        });

        // Signal handling for WebRTC
        socket.on('signal', ({ roomId, signalData, targetPeerId }) => {
            console.log(`Signaling from ${socket.id} to ${targetPeerId}`);
            io.to(targetPeerId).emit('signal', { signalData, peerId: socket.id });
        });

        // Handle peer disconnect
        socket.on('disconnecting', () => {
            const rooms = [...socket.rooms].filter((room) => room !== socket.id);
            rooms.forEach((roomId) => {
                console.log(`User disconnected from room: ${roomId}`);
                socket.to(roomId).emit('peer-left', { peerId: socket.id });
            });
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

module.exports = { configureSocket };
