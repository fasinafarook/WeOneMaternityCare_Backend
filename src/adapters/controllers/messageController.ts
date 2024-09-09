import { NextFunction, Request, Response } from "express";
import Conversation from "../../infrastructure/database/converstationModel";

export const sendMessage = async (req:Request,res:Response) =>{
try {
    const {message} = req.body;
    const {id:receiverId} = req.params;
    const senderId = req.userId;
    let conversation = await Conversation.findOne({
        participants:{$all:[senderId, receiverId]}
    })

    if(!conversation){
        conversation = await Conversation.create({
            participants:[senderId, receiverId]
        })

    }
} catch (error:any) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};