import { IMessageRepository } from "../interfaces/repositories/IMessageRepository";
import { MessageRepository } from "../infrastructure/repository/messageRepository";
import { getReceiverSocketId, io } from "../infrastructure/config/socket";
import { log } from "util";
export class MessageUseCase {
  private messageRepository: IMessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async sendMessage(senderId: string, receiverId: string, message: string) {
    let conversation = await this.messageRepository.findConversation(
      senderId,
      receiverId
    );

    if (!conversation) {
      conversation = await this.messageRepository.createConversation(
        senderId,
        receiverId
      );
    }

    const newMessage = await this.messageRepository.saveMessage({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();
console.log('con');

    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log('receiverSocketId',receiverSocketId);

    if (receiverSocketId) {
      console.log('oo',receiverSocketId);
      
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return newMessage;
  }

  async getMessages(senderId: string, receiverId: string) {
    const conversation = await this.messageRepository.findConversation(
      senderId,
      receiverId
    );
    if (!conversation) return [];
    return await this.messageRepository.getMessages(conversation._id);
  }
}
