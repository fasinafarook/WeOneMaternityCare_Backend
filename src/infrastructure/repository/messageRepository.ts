import { IMessageRepository } from "../../interfaces/repositories/IMessageRepository";
import Conversation from "../../infrastructure/database/converstationModel";
import Message from "../../infrastructure/database/messageModel";

export class MessageRepository implements IMessageRepository {
  async findConversation(senderId: string, receiverId: string) {
    return await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
  }

  async createConversation(senderId: string, receiverId: string) {
    return await Conversation.create({ participants: [senderId, receiverId] });
  }

  async saveMessage(messageData: any) {
    const message = new Message(messageData);
    await message.save();
    return message;
  }

  async getMessages(conversationId: string) {
    const conversation = await Conversation.findOne({ _id: conversationId }).populate("messages");
    return conversation ? conversation.messages : [];
  }
}
