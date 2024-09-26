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
      const senderId = req.userId;  // Assuming userAuth sets req.userId

      if (!senderId) {
        throw new Error("Sender ID is missing or invalid");
      }

      const newMessage = await this.messageUseCase.sendMessage(senderId, receiverId, message);

      res.status(201).json(newMessage);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: receiverId } = req.params;
      const senderId = req.userId;  // Assuming userAuth sets req.userId

      if (!senderId) {
        throw new Error("Sender ID is missing or invalid");
      }

      const messages = await this.messageUseCase.getMessages(senderId, receiverId);

      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  }
}

export default MessageController;



// import { NextFunction, Request, Response } from "express";
// import Conversation from "../../infrastructure/database/converstationModel";
// import Message from "../../infrastructure/database/messageModel";
// import { getReceiverSocketId,io } from "../../infrastructure/config/socket";
// export const sendMessage = async (req:Request,res:Response) =>{
// try {
//     const {message} = req.body;
//     const {id:receiverId} = req.params;
//     const senderId = req.userId;
//     let conversation = await Conversation.findOne({
//         participants:{$all:[senderId, receiverId]}
//     })

//     if(!conversation){
//         conversation = await Conversation.create({
//             participants:[senderId, receiverId]
//         })

//     }

//     const newMessage = new Message({
//         senderId,
//         receiverId,
//         message
//     })

//     if(newMessage){
//         console.log('new');
        
//         conversation.messages.push(newMessage._id)
//     }
//     // await conversation.save(); // Save the updated conversation
//     // await newMessage.save(); // Save the updated conversation

    // await Promise.all([conversation.save(),newMessage.save()])
    // const receiverSocketId = getReceiverSocketId(receiverId)
    // if(receiverSocketId){
    //     io.to(receiverSocketId).emit("newMessage",newMessage)
    // }
//     res.status(201).json(newMessage)
// } catch (error:any) {
//     console.log("Error in sendMessage controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


// export const getMessages = async (req:Request,res:Response)=>{
// try {
//     const {id:userToChatId} = req.params;
//     const senderId  = req.userId;
//     const conversation = await Conversation.findOne({
//         participants:{$all:[senderId,userToChatId]}
//     }).populate("messages");
//     if(!conversation) return res.status(200).json([]);
//     const messages = conversation.messages;
//     res.status(200).json(messages)
// } catch (error:any) {
//     console.log("Error in sendMessage controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
