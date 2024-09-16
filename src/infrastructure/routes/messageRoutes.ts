import express from "express";
const messageRouter = express.Router();
import { sendMessage ,getMessages} from "../../adapters/controllers/messageController";

import userAuth from "../middlewares/userAuth";



messageRouter.get("/:id",userAuth,getMessages)

messageRouter.post("/send/:id",userAuth,sendMessage)


export default messageRouter;



// import express from "express";
// const messageRouter = express.Router();
// // import { sendMessage ,getMessages} from "../../adapters/controllers/messageController";
// import MessageController from "../../adapters/controllers/messageController";
// import { MessageUseCase } from "../../use-case/messageUseCase";
// import { MessageRepository } from "../repository/messageRepository";

// import userAuth from "../middlewares/userAuth";
// const messageRepository = new MessageRepository();

// const useCase = new MessageUseCase();
// const controller = new MessageController();


// messageRouter.get("/:id",userAuth,controller.getMessages)

// messageRouter.post("/send/:id",userAuth,controller.sendMessage)


// export default messageRouter;
