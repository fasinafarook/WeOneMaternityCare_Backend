// import { Request, Response, NextFunction } from 'express';
// import UserRepository from '../repository/userRepository';
// import ServiceProviderRepository from '../repository/serviceProviderRepository';


// // Extend the Request interface to include the 'user' and 'provider' properties
// interface CustomRequest extends Request {
//     user?: any;  // Replace 'any' with the actual User type
//     provider?: any;  // Replace 'any' with the actual ServiceProvider type
// }

// // Create instances of the repositories
// const userRepository = new UserRepository();
// const serviceProviderRepository = new ServiceProviderRepository();

// export const blockMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
//     try {
//         // Assuming `req.user` is being set somewhere in your authentication middleware
//         if (req.user) {
//             console.log('idss:',req.user);
            
//             const user = await userRepository.findUserById(req.user.id);
//             if (user && user.isBlocked) {
//                 return res.status(403).json({ message: 'User is blocked' });
//             }
//         }

//         if (req.provider) {
//             console.log('ids:',req.provider);
//             const provider = await serviceProviderRepository.findById(req.provider.id);
//             if (provider && provider.isBlocked) {
//                 return res.status(403).json({ message: 'Service Provider is blocked' });
//             }
//         }

//         next();
//     } catch (error) {
//         next(error);
//     }
// };
