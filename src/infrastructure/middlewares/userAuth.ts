import { Request, Response, NextFunction, RequestHandler } from "express"
import JwtToken from "../utils/JwtToken"
import UserRepository from "../repository/userRepository"


const jwt = new JwtToken(process.env.JWT_SECRET as string)
const userRepository = new UserRepository



declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}

const userAuth = async (req: Request, res: Response, next: NextFunction) => {

    let token = req.cookies.userToken

    if(!token){
        return res.status(401).json({success: false, message: "Unauthorized, No token provided"})
    }

    try {
        const decodedToken = jwt.verifyJwtToken(token)
        if(decodedToken && decodedToken.role !== "user"){
            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }

        if(decodedToken && decodedToken.id){
            const user = await userRepository.findUserById(decodedToken.id)
            if(user?.isBlocked){
                res.clearCookie("userToken")
                return res.status(403).send({success: false, message: "You are blocked!"})
            }
            req.userId = user?._id;
            next()
        }else {
            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }
    } catch (error) {
        console.log(error);
        return res.status(401).send({ success: false, message: "Unauthorized - Invalid token" })
    }
}

export default userAuth; 