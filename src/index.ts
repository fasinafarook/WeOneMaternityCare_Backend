import dotenv from 'dotenv';
import connectDB from './infrastructure/config/MongoDB';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './infrastructure/routes/userRoutes';
import adminRouter from './infrastructure/routes/adminRoutes';
import serviceProvider from './infrastructure/routes/serviceProviderRoutes';
import paymentRouter from './infrastructure/routes/paymentRoutes';
import express, { Request, Response, NextFunction } from 'express';
import errorMiddleware from './infrastructure/middlewares/errorMiddleware';
import messageRouter from './infrastructure/routes/messageRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: ["http://localhost:5173"], // Update to match frontend port
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/payment/webhook') {
    // Use express.raw() to parse the raw body needed for Stripe webhooks
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    // Use express.json() for all other routes
    express.json()(req, res, next);
  }
});

app.use(cookieParser());
app.use(bodyParser.json());


app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/serviceProvider', serviceProvider);
app.use("/payment", paymentRouter);
app.use("/message", messageRouter);

app.use(errorMiddleware);



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});



// // import dotenv from 'dotenv';
// // import connectDB from './infrastructure/config/MongoDB';
// // import express, { Request, Response, NextFunction } from 'express';
// // import bodyParser from 'body-parser';
// // import cors from 'cors';
// // import cookieParser from 'cookie-parser';
// // import userRouter from './infrastructure/routes/userRoutes';
// // import adminRouter from './infrastructure/routes/adminRoutes';
// // import serviceProvider from './infrastructure/routes/serviceProviderRoutes';
// // import paymentRouter from './infrastructure/routes/paymentRoutes';

// // dotenv.config();

// // const app = express();
// // const port = process.env.PORT || 5000;

// // connectDB();

// // app.use(cors({
// //   origin: ["http://localhost:5173"], // Update to match frontend port
// //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// //   credentials: true,
// // }));

// // app.use((req: Request, res: Response, next: NextFunction) => {
// //   if (req.originalUrl === '/payment/webhook') {
// //     // Use express.raw() to parse the raw body needed for Stripe webhooks
// //     express.raw({ type: 'application/json' })(req, res, next);
// //   } else {
// //     // Use express.json() for all other routes
// //     express.json()(req, res, next);
// //   }
// // });

// // app.use(cookieParser());
// // app.use(bodyParser.json());

// // app.use('/user', userRouter);
// // app.use('/admin', adminRouter);
// // app.use('/serviceProvider', serviceProvider);
// // app.use("/payment", paymentRouter);

// // app.listen(port, () => {
// //   console.log(`Server is running at http://localhost:${port}`);
// // });








// import dotenv from 'dotenv';
// import connectDB from './infrastructure/config/MongoDB';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import userRouter from './infrastructure/routes/userRoutes';
// import adminRouter from './infrastructure/routes/adminRoutes';
// import serviceProvider from './infrastructure/routes/serviceProviderRoutes';
// import paymentRouter from './infrastructure/routes/paymentRoutes';
// import express, { Request, Response, NextFunction } from 'express';
// import http from 'http'; // Import http for server
// import socket from 'socket.io'; // Import socket.io
// import errorMiddleware from './infrastructure/middlewares/errorMiddleware';

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;
// const server = http.createServer(app); // Create an HTTP server

// const io = new socket.Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Your frontend URL
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// // Setup socket.io
// // io.on('connection', (socket) => {
// //   console.log('New client connected');

// //   socket.on('join-room', (roomId) => {
// //     console.log(`Client ${socket.id} joined room ${roomId}`);
// //     socket.join(roomId);
// //   });

// //   socket.on('offer', (data) => {
// //     console.log(`Received offer from ${socket.id} for room ${data.roomId}`);
// //     io.to(data.roomId).emit('offer', { offer: data.offer, sender: socket.id });
// //   });

// //   socket.on('answer', (data) => {
// //     console.log(`Received answer from ${socket.id} for room ${data.roomId}`);
// //     io.to(data.roomId).emit('answer', { answer: data.answer, sender: socket.id });
// //   });

// //   socket.on('ice-candidate', (data) => {
// //     console.log(`Received ICE candidate from ${socket.id} for room ${data.roomId}`);
// //     io.to(data.roomId).emit('ice-candidate', { candidate: data.candidate, sender: socket.id });
// //   });

// //   socket.on('leave-room', (roomId) => {
// //     console.log(`Client ${socket.id} left room ${roomId}`);
// //     socket.leave(roomId);
// //   });

// //   socket.on('disconnect', () => {
// //     console.log(`Client ${socket.id} disconnected`);
// //   });
// // });
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // When the user joins a room
//   socket.on("join-room", (roomId) => {
//     socket.join(roomId);
//     console.log(`${socket.id} joined room ${roomId}`);
//     socket.to(roomId).emit("user-connected", socket.id);
//   });

//   // When an offer is sent
//   socket.on("offer", (data) => {
//     console.log(`${socket.id} room ${data}`);

//     io.to(data.roomId).emit("offer", data);
//   });

//   // When an answer is sent
//   socket.on("answer", (data) => {
//     console.log(`${socket.id} ansr ${data}`);

//     io.to(data.roomId).emit("answer", data);
//   });

//   // ICE candidates are exchanged
//   socket.on("ice-candidate", (data) => {
//     console.log(`${socket.id} cndi ${data}`);

//     io.to(data.roomId).emit("ice-candidate", data);
//   });

//   // When a user disconnects
//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });


// connectDB();

// app.use(cors({
//   origin: ["http://localhost:5173"], // Update to match frontend port
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
// }));

// app.use((req: Request, res: Response, next: NextFunction) => {
//   if (req.originalUrl === '/payment/webhook') {
//     // Use express.raw() to parse the raw body needed for Stripe webhooks
//     express.raw({ type: 'application/json' })(req, res, next);
//   } else {
//     // Use express.json() for all other routes
//     express.json()(req, res, next);
//   }
// });

// app.use(cookieParser());
// app.use(bodyParser.json());

// app.use('/user', userRouter);
// app.use('/admin', adminRouter);
// app.use('/serviceProvider', serviceProvider);
// app.use("/payment", paymentRouter);
// app.use(errorMiddleware);

// server.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });
