import { Server } from 'socket.io';
console.log('socket');

function socketServer(server: any) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173"], // Adjust as needed
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`Client ${socket.id} joined room ${roomId}`);
        });

        socket.on('offer', (data) => {
            socket.to(data.roomId).emit('offer', data.offer);
        });

        socket.on('answer', (data) => {
            socket.to(data.roomId).emit('answer', data.answer);
        });

        socket.on('ice-candidate', (data) => {
            socket.to(data.roomId).emit('ice-candidate', data.candidate);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}

export default socketServer;
