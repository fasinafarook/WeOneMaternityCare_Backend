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
// import errorMiddleware from './infrastructure/middlewares/errorMiddleware';
// import messageRouter from './infrastructure/routes/messageRoutes';
// import { apps,server } from './infrastructure/config/socket';
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;

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
// app.use("/message", messageRouter);

// app.use(errorMiddleware);



// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });


// src/index.ts
import dotenv from 'dotenv';
import connectDB from './infrastructure/config/MongoDB';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import userRouter from './infrastructure/routes/userRoutes';
import adminRouter from './infrastructure/routes/adminRoutes';
import serviceProviderRouter from './infrastructure/routes/serviceProviderRoutes';
import paymentRouter from './infrastructure/routes/paymentRoutes';
import messageRouter from './infrastructure/routes/messageRoutes';
import errorMiddleware from './infrastructure/middlewares/errorMiddleware';
import { apps, server } from './infrastructure/config/socket';

dotenv.config();

const app = apps; // Using 'apps' from socket configuration
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
app.use('/serviceProvider', serviceProviderRouter);
app.use("/payment", paymentRouter);
app.use("/message", messageRouter);

app.use(errorMiddleware);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
