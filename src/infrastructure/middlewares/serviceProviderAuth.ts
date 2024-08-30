import { Request, Response, NextFunction, RequestHandler } from "express"
import JwtToken from "../utils/JwtToken"
import ServiceProviderRepository from "../repository/serviceProviderRepository"


const jwt = new JwtToken(process.env.JWT_SECRET as string)
const serviceProviderRepository = new ServiceProviderRepository()

interface RequestModified extends Request {
    serviceProviderId?: string
}

// 2 ways to add a property to the Request type

declare global {
    namespace Express {
        interface Request {
            serviceProviderId?: string
        }
    }
}

const serviceProviderAuth = async (req: RequestModified, res: Response, next: NextFunction) => {

    let token = req.cookies.serviceProviderToken
    console.log('gdfhhhh',token);
    
    
    if(!token){
        return res.status(401).json({success: false, message: "Unauthorized, No token provided"})
    }

    try {
        const decodedToken = jwt.verifyJwtToken(token)
        if(decodedToken && decodedToken.role !== "serviceProvider"){

            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }

        if(decodedToken && decodedToken.id){
            console.log('tokenn',decodedToken,decodedToken.id);

            const serviceProvider = await serviceProviderRepository.findServiceProviderById(decodedToken.id);
            console.log('tokennjkhdk',serviceProvider);

            if(serviceProvider?.isBlocked){
                console.log('isBlocked:', serviceProvider?.isBlocked);

                return res.status(401).send({success: false, message: "You are blocked!"})
            }
            req.serviceProviderId = serviceProvider?._id;
            next()
        }else {

            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }
    } catch (error) {
        console.log(error);
        return res.status(401).send({ success: false, message: "Unauthorized - Invalid token" })
    }
}

export default serviceProviderAuth 