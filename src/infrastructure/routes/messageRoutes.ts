
import express from "express";
import MessageController from "../../adapters/controllers/messageController";

import { MessageUseCase } from "../../use-case/messageUseCase";
import { MessageRepository } from "../repository/messageRepository";
import userAuth from "../middlewares/userAuth";
const router = express.Router();

const messageRepository = new MessageRepository();
const messageUseCase = new MessageUseCase();
const messageController = new MessageController();

router.post("/send/:id", userAuth, (req, res, next) => messageController.sendMessage(req, res, next));
router.get("/:id", userAuth, (req, res, next) => messageController.getMessages(req, res, next));


export default router;

