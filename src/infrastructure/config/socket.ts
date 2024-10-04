import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import fs from 'fs';


const apps = express();

// const serverOptions = {
//   key: fs.readFileSync('/etc/letsencrypt/live/weone-maternitycare.online/privkey.pem'),  // Path to your private key file
//   cert: fs.readFileSync('/etc/letsencrypt/live/weone-maternitycare.online/fullchain.pem'),  // Path to your SSL certificate file
// };

const server = http.createServer(apps);
const io = new Server(server, {
  cors: {
    origin: 'https://weone-maternitycare.online',
    methods: ["GET", "POST"],
  },
  path: '/ws/' 
});

export const getReceiverSocketId = (receiverId: string): string | undefined =>{
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
