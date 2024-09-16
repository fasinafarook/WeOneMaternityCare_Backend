// src/repositories/messageRepository.ts
import { IMessageRepository } from "../../interfaces/repositories/IMessageRepository";
import Conversation from "../../infrastructure/database/converstationModel";
import Message from "../../infrastructure/database/messageModel";
import { getReceiverSocketId } from "../../infrastructure/config/socket";

export class MessageRepository implements IMessageRepository {
   async findConversation(senderId: string, receiverId: string) {
    return await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });
  }

   async createConversation(senderId: string, receiverId: string) {
    return await Conversation.create({
      participants: [senderId, receiverId]
    });
  }

   async createMessage(senderId: string, receiverId: string, message: string) {
    return await Message.create({
      senderId,
      receiverId,
      message
    });
  }

   async saveConversation(conversation: any) {
    return await conversation.save();
  }

   async saveMessage(message: any) {
    return await message.save();
  }

   getReceiverSocketId(receiverId: string) {
    return getReceiverSocketId(receiverId);
  }
}
