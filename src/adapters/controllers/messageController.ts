import { Request, Response, NextFunction } from "express";
import { MessageUseCase } from "../../use-case/messageUseCase";

class MessageController {
  private messageUseCase: MessageUseCase;

  constructor() {
    this.messageUseCase = new MessageUseCase();

    // Bind methods to the class instance
    this.sendMessage = this.sendMessage.bind(this);
    this.getMessages = this.getMessages.bind(this);
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.userId;

      if (!senderId) {
        throw new Error("Sender ID is missing or invalid");
      }

      const newMessage = await this.messageUseCase.sendMessage(
        senderId,
        receiverId,
        message
      );

      res.status(201).json(newMessage);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: receiverId } = req.params;
      const senderId = req.userId;

      if (!senderId) {
        throw new Error("Sender ID is missing or invalid");
      }

      const messages = await this.messageUseCase.getMessages(
        senderId,
        receiverId
      );

      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  }
}

export default MessageController;
