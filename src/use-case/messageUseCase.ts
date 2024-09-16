// src/usecases/messageUseCase.ts
import { IMessageRepository } from "../interfaces/repositories/IMessageRepository";
import { MessageRepository } from "../infrastructure/repository/messageRepository";
import { io } from "../infrastructure/config/socket";
export class MessageUseCase {
    private messageRepository: IMessageRepository;
  
    constructor() {
      this.messageRepository = new MessageRepository();
    }
  
     async sendMessage(senderId: string, receiverId: string, message: string) {
      let conversation = await this.messageRepository.findConversation(senderId, receiverId);
  
      if (!conversation) {
        conversation = await this.messageRepository.createConversation(senderId, receiverId);
      }
  
      const newMessage = await this.messageRepository.createMessage(senderId, receiverId, message);
  
      if (newMessage) {
        conversation.messages.push(newMessage._id);
      }
  
      await Promise.all([this.messageRepository.saveConversation(conversation), this.messageRepository.saveMessage(newMessage)]);
  
      const receiverSocketId = this.messageRepository.getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
  
      return newMessage;
    }
  
     async getMessages(senderId: string, userToChatId: string) {
      const conversation = await this.messageRepository.findConversation(senderId, userToChatId);
      
      // Ensure conversation is not null before populating
      if (!conversation) {
        return [];
      }
  
      // Populate messages field
      await conversation.populate("messages").execPopulate(); 
  
      return conversation.messages;
    }
  }