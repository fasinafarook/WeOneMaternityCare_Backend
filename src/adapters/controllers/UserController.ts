import mongoose from "mongoose";
import AppError from "../../infrastructure/utils/appError";
import UserUseCase from "../../use-case/userUse-case";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import users from "../../infrastructure/database/userModel";
import { ScheduledBookingModel } from "../../infrastructure/database/scheduledBookingsModel";
class UserController {
  constructor(private userCase: UserUseCase) {}

  async verifyUserEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body;
      const userInfo = req.body;

      const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
      const nameRegex = /^[a-zA-Z ]{2,30}$/;

      if (!email?.trim()) {
        throw new AppError("Email is required", 400);
      }

      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }

      if (!name?.trim()) {
        throw new AppError("Name is required", 400);
      }

      if (!nameRegex.test(name)) {
        throw new AppError("Invalid name format", 400);
      }
      const response = await this.userCase.findUser(userInfo);

      if (response?.status === 200) {
        throw new AppError("User already exists", 400);
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      if (!token) throw new AppError("Unauthorised user", 401);

      const userInfo = await this.userCase.getUserInfoUsingToken(token);
      if (!userInfo) {
        throw new AppError("No user found", 400);
      }

      const response = await this.userCase.findUser(userInfo);
      if (response?.status === 200) {
        throw new AppError("User already exists", 400);
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      const { otp } = req.body;

      const saveUser = await this.userCase.saveUser(token, otp);

      if (saveUser.success) {
        res.cookie("userToken", saveUser.token);
        return res
          .status(200)
          .json({
            success: true,
            token: saveUser.token,
            message: "OTP verified",
          });
      } else {
        res.status(400).json({ success: false, message: "OTP not verified" });
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await this.userCase.userLogin(email, password);
      if (user?.success) {
        res.cookie("userToken", user.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true,
          secure: true, // use true if you're serving over https
          sameSite: "none", // allows cross-site cookie usage
        });

        res.status(200).json(user);
      }
    } catch (error) {
      next(error);
    }
  }

  logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.cookie("userToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // async home (req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const stacksList = await this.userCase.findAllC()
  //     return res.status(200).json({success: true, data: {stacks: stacksList}})
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  async home(req: Request, res: Response, next: NextFunction) {
    try {
      // Fetch any other relevant data instead of stacksList if needed
      // For example, if you want to return a welcome message or other info, do it here
      const welcomeMessage = "Welcome to the home page!";

      return res
        .status(200)
        .json({ success: true, data: { message: welcomeMessage } });
    } catch (error) {
      next(error);
    }
  }

  async getProfileDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError("userId id not found", 400);
      const user = await this.userCase.getProfileDetails(userId);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.userCase.getAllCategories();
      return res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, mobile } = req.body;
      const userId = req.userId;
      if (!userId) throw new AppError("user id not found", 400);
      await this.userCase.editProfile(userId, name, mobile);
      return res
        .status(200)
        .send({ success: true, message: "Profile update successfully" });
    } catch (error) {
      next(error);
    }
  }

  async editPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body;
      if (!userId) throw new AppError("user id not found", 400);
      await this.userCase.editPassword(userId, currentPassword, newPassword);
      return res
        .status(200)
        .send({ success: true, message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getApprovedAndUnblockedProviders(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const providers = await this.userCase.getApprovedAndUnblockedProviders();
      res.json(providers);
    } catch (error) {
      next(error); // Pass error to the next middleware
    }
  }

  async getServiceProviderDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      console.log("id:", id);

      const serviceProvidersDetails =
        await this.userCase.ServiceProviderDetails(id);
      return res.status(200).json({
        success: true,
        data: serviceProvidersDetails,
        message: "ServiceProviders details fetched",
      });
    } catch (error) {
      next(error);
    }
  }

  async getProviderSlotsDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { serviceProviderId } = req.params;

      if (!serviceProviderId)
        throw new AppError("Service provider ID is required", 400);

      // Fetch details based on serviceProviderId
      const details = await this.userCase.getProviderSlotDetails(
        serviceProviderId
      );

      return res.status(200).json({ success: true, data: { details } });
    } catch (error) {
      next(error);
    }
  }

  async getScheduledBookingList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.userId;

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (!userId) {
        throw new AppError("Failed to get user id", 400);
      }

      const { bookings, total } = await this.userCase.getScheduledBookingList(
        userId,
        page,
        limit
      );
      return res.status(200).json({ success: true, data: bookings, total });
    } catch (error) {
      next(error);
    }
  }

  async getListedWebinars(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const webinars = await this.userCase.getListedWebinars();
      res.status(200).json(webinars);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve webinars" });
      next(error);
    }
  }
  async getBlogs(req: Request, res: Response, next: NextFunction) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    try {
      const { blogs, total } = await this.userCase.getListedBlogs(page, limit);
      res.json({ success: true, blogs, total });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch blogs" });
    }
  }

  async getWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      console.log("dd", userId);

      if (!userId) throw new AppError("provider Id not found", 400);

      const data = await this.userCase.getWallet(userId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }




 // In your controller file
async fileComplaint(req: Request, res: Response): Promise<void> {
  try {
    console.log('re',req.body);
    
    const { userId, subject, message } = req.body;
    
    // Validate request body
    if (!userId || !subject || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Create a complaint object
    const complaint = {
      userId,
      subject,
      message,
      isResolved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Call a service or use case to handle the complaint
    const result = await this.userCase.fileComplaint(complaint);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error filing complaint:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to file complaint' });
  }
}


  async getUserComplaints(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const complaints = await this.userCase.getUserComplaints(userId);
      res.status(200).json(complaints);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get complaints' });
    }
  }

  async  getUsersForSidebar(req: Request, res: Response): Promise<void> {
    try {
      const loggedInUserId = req.userId;
  
      // Find users with at least one completed booking, excluding the logged-in user
      const completedBookingUsers = await ScheduledBookingModel.find({
        status: "Completed",
        userId: { $ne: loggedInUserId },
      }).distinct("userId"); // Get distinct userIds who have completed bookings
  
      // Fetch user details, excluding password, and only for users with completed bookings
      const filteredUsers = await users
        .find({ _id: { $in: completedBookingUsers } })
        .select("-password");
  
      res.status(200).json(filteredUsers);
    } catch (error: any) {
      console.error("Error in getUsersForSidebar:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  


 async getCompletedBookings (req: Request, res: Response)  {
    const userId = req.params.userId; // Assuming userId is passed as a param
    console.log('idhead:',userId);
    
  
    try {
      const completedBookings = await ScheduledBookingModel.find({
        userId: userId,
        status: "Completed",
      });
  console.log('cm',completedBookings);
  
      if (!completedBookings.length) {
        return res.status(404).json({ success: false, message: "No completed bookings found" });
      }
  
      return res.status(200).json({
        success: true,
        data: completedBookings,
      });
    } catch (error) {
      console.error("Error fetching completed bookings:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }


  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const {email} = req.body
      console.log(email)
      const token = await this.userCase.passwordReset(email)
      if (!token) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({success: true, data: token})
    } catch (error) {
      next(error)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string;
      if(!token) throw new AppError("Unauthorised user", 401);

      const {otp, password} = req.body
      await this.userCase.resetPassword(otp, password, token)
      return res.status(201).json({success: true, message: "Password changed successfully"})
      
    } catch (error) {
      next(error)
    }
  }

}

export default UserController;
