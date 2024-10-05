import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
// import fs from 'fs';


const apps = express();

console.log('servr');



const server = http.createServer(apps);
console.log('servrs');

const io = new Server(server, {
  cors: {
    origin: 'https://weone-maternitycare.online',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  },
});
console.log('servrsss');

export const getReceiverSocketId = (receiverId: string): string | undefined =>{
  console.log('servrsssssss',receiverId);

return userSocketMap[receiverId]
}
const userSocketMap: Record<string, string> = {};

io.on('connection', (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { apps, server ,io};
