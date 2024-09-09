import express from "express";
const messageRouter = express.Router();
import { sendMessage } from "../../adapters/controllers/messageController";
import userAuth from "../middlewares/userAuth";




messageRouter.post("/send/:id",userAuth,sendMessage)


export default messageRouter;
