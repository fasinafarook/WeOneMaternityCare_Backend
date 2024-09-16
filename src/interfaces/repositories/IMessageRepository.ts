// src/repositories/IMessageRepository.ts
export interface IMessageRepository {
    findConversation(senderId: string, receiverId: string): Promise<any>;
    createConversation(senderId: string, receiverId: string): Promise<any>;
    createMessage(senderId: string, receiverId: string, message: string): Promise<any>;
    saveConversation(conversation: any): Promise<any>;
    saveMessage(message: any): Promise<any>;
    getReceiverSocketId(receiverId: string): string | undefined;
  }
  