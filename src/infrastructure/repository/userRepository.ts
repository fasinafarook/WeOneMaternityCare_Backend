import users from "../database/userModel";
import IUser from "../../domain/entities/user";
import IUserRepository, {
  ProviderBasic,
} from "../../interfaces/repositories/IUserRepository";
import AppError from "../utils/appError";
import ServiceProvider from "../../domain/entities/serviceProvider";
import { serviceProviderModel } from "../database/serviceProviderModel";
import { ProviderSlotModel } from "../database/providerSlotModel";
import { ScheduledBookingModel } from "../database/scheduledBookingsModel";
import ScheduledBooking from "../../domain/entities/scheduledBookings";
import { IWebinar } from "../../domain/entities/webinars";
import webinarModel from "../database/webinarModel";
import { IBlog } from "../../domain/entities/blog";
import { BlogModel } from "../database/blogModel";
import { WalletModel } from "../database/walletModel";
import Category from "../../domain/entities/category";
import { CategoryModel } from "../database/categoryModel";
import { Complaint } from "../database/complaints";
import { IComplaint } from "../../domain/entities/complaint";

class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    const userExists = await users.findOne({ email: email });
    // if (!userExists) {
    //   throw new AppError("User not found", 404);
    // }
    return userExists;
  }

  async saveUser(user: IUser): Promise<IUser | null> {
    const newUser = new users(user);
    const savedUser = await newUser.save();
    if (!savedUser) {
      throw new AppError("Failed to save candidate", 500);
    }
    return savedUser;
  }

  async findUserById(id: string): Promise<IUser | null> {
    const userData = await users.findById(id);
    if (!userData) {
      throw new AppError("Candidate not found", 404);
    }
    return userData;
  }
  async updatePassword(userId: string, password: string): Promise<void | null> {
    await users.findByIdAndUpdate(userId, {
      password: password,
    });
  }
  async editProfile(
    userId: string,
    name: string,
    mobile: number
  ): Promise<void> {
    // Update only the name and mobile fields
    await users.findByIdAndUpdate(userId, {
      name: name,
      mobile: mobile,
    });
  }

  async getApprovedAndUnblockedProviders(): Promise<ServiceProvider[]> {
    return serviceProviderModel
      .find({ isApproved: true, isBlocked: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getServiceProviderDetails(id: string): Promise<ServiceProvider | null> {
    const serviceProvidersDetails = await serviceProviderModel.findById(id);
    if (!serviceProvidersDetails) {
      throw new AppError("ServiceProviders not found", 404);
    }
    return serviceProvidersDetails;
  }
  async getAllCategories(): Promise<string[]> {
    // Fetch categories and return an array of category names
    const categories = await CategoryModel.find({ isListed: true }).select("categoryName");
    return categories.map((category) => category.categoryName);
  }
  



  async getProviderSlotDetails(serviceProviderId: string): Promise<any> {
    // Fetch basic information about the service provider
    const providerDetails = await serviceProviderModel.findById(serviceProviderId, {
      name: 1,
      location: 1,
      service: 1,
      profilePicture: 1,
      expYear: 1,
    });
  
    const currentDate = new Date();
    const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfToday = new Date(currentDate.setHours(23, 59, 59, 999));
  
    // Fetch slots for the service provider
    const bookingSlotDetails = await ProviderSlotModel.aggregate([
      {
        $match: { serviceProviderId: serviceProviderId },
      },
      {
        $unwind: "$slots",
      },
      {
        $unwind: "$slots.schedule",
      },
      {
        $match: {
          $or: [
            // For future days, we just check if the date is after today
            { "slots.date": { $gt: endOfToday } },
            // For today, check if the time is later than the current time
            {
              $and: [
                { "slots.date": { $gte: startOfToday, $lte: endOfToday } },
                { "slots.schedule.from": { $gte: new Date() } }, // Check for upcoming time slots today
              ],
            },
          ],
        },
      },
      {
        $sort: { "slots.date": 1, "slots.schedule.from": 1 }, // Sort by date and time
      },
    ]);
  
    return {
      providerDetails,
      bookingSlotDetails,
    };
  }
  
  async bookSlot(info: any): Promise<void> {
    const { serviceProviderId, _id, date, userId } = info;

    try {
      const slot = await ProviderSlotModel.findOneAndUpdate(
        {
          serviceProviderId: serviceProviderId,
          "slots.date": date,
          "slots.schedule._id": _id,
        },
        {
          $set: { "slots.$[slotElem].schedule.$[schedElem].status": "booked" },
        },
        {
          arrayFilters: [{ "slotElem.date": date }, { "schedElem._id": _id }],
          new: true, // Return the updated document
        }
      );

      return;
    } catch (error) {
      throw error;
    }
  }

  async getScheduledBookings(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ bookings: ScheduledBooking[] | null; total: number }> {
    const bookingList = await ScheduledBookingModel.find({ userId: userId })
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .limit(limit);

    const total = await ScheduledBookingModel.countDocuments({ userId });

    return { bookings: bookingList, total };
  }

  async getListedWebinars(): Promise<IWebinar[]> {
    return webinarModel.find({ isListed: true }).sort({ createdAt: -1 }).exec();
  }

  async getListedBlogs(
    page: number,
    limit: number
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const skip = (page - 1) * limit;

    // Fetch the blogs from the database
    const [blogs, total] = await Promise.all([
      BlogModel.find({ isListed: true }).skip(skip).sort({ createdAt: -1 }).limit(limit).exec(),
      BlogModel.countDocuments({ isListed: true }),
    ]);

    return { blogs, total };
  }

  async getWallet(userId: string): Promise<any> {
    const bookings = await ScheduledBookingModel.aggregate([
      {
        $match: { userId: userId.toString() },
      },
      {
        $lookup: {
          from: "serviceProviders", // Ensure this matches your service providers collection name
          let: { serviceProviderId: { $toObjectId: "$serviceProviderId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$serviceProviderId"] },
              },
            },
          ],
          as: "serviceProvider", // Changed to correctly reflect that this lookup is for service providers
        },
      },
      { $unwind: "$serviceProvider" },
      {
        $project: {
          "serviceProvider.password": 0,
          "serviceProvider.email": 0,
          "serviceProvider.mobile": 0,
        },
      },
    ]);

    const totalEarnings = await ScheduledBookingModel.aggregate([
      {
        $match: { userId: userId.toString() },
      },
      {
        $group: { _id: null, total: { $sum: "$price" } },
      },
    ]);

    const wallet = await WalletModel.findOne({
      ownerId: userId,
      ownerType: "user",
    });
    console.log("wallet", wallet);

    const totalRevenue = totalEarnings[0]?.total;
    console.log("revenue", totalRevenue);

    return { bookings, totalRevenue, wallet };
  }

  async getScheduledBookingByRoomId(roomId: string): Promise<ScheduledBooking | null> {
    const interview = await ScheduledBookingModel.findOne({roomId: roomId})
    return interview
  }

  async createComplaint(complaint: IComplaint): Promise<IComplaint> {
    const newComplaint = new Complaint(complaint);
    await newComplaint.save();
    return newComplaint.toObject();
  }

  async getComplaintsByUser(userId: string): Promise<IComplaint[]> {
    return Complaint.find({ userId }).exec();
  }

  

}
 
  


export default UserRepository;
