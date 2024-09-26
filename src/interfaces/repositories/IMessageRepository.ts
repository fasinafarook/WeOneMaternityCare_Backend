// src/repositories/IMessageRepository.ts
export interface IMessageRepository {
  findConversation(senderId: string, receiverId: string): Promise<any>;
  createConversation(senderId: string, receiverId: string): Promise<any>;
  saveMessage(messageData: any): Promise<any>;
  getMessages(conversationId: string): Promise<any>;
  }
  