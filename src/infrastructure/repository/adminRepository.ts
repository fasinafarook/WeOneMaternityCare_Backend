import IAdminRepository from "../../interfaces/repositories/IAdminRepository";

import Admin from "../../domain/entities/admin";
import { adminModel } from "../database/adminModel";

import AppError from "../utils/appError";

import IUser from "../../domain/entities/user";
import users from "../database/userModel";

import ServiceProvider from "../../domain/entities/serviceProvider";
import { serviceProviderModel } from "../database/serviceProviderModel";

import Category from "../../domain/entities/category";
import { CategoryModel } from "../database/categoryModel";

import { IBlog } from "../../domain/entities/blog";
import { BlogModel } from "../database/blogModel";

import WebinarModel from "../database/webinarModel";
import { IWebinar } from "../../domain/entities/webinars";
import webinarModel from "../database/webinarModel";


import { Complaint } from "../database/complaints";


import ScheduledBooking from "../../domain/entities/scheduledBookings";
import { ScheduledBookingModel } from "../database/scheduledBookingsModel";

class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    const adminExists = await adminModel.findOne({ email });
    if (!adminExists) {
      throw new AppError("Admin not found", 404);
    }
    return adminExists;
  }

  async findAllUsers(
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    const usersList = await users
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await users.find().countDocuments();
    if (!usersList) {
      throw new AppError("Failed to fetch users from database", 500);
    }
    return { users: usersList, total };
  }

  async blockUser(userId: string): Promise<boolean> {
    const user = await users.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    await users.findOneAndUpdate(
      { _id: userId },
      { isBlocked: !user.isBlocked }
    );
    return true;
  }

  async findAllServiceProviders(
    page: number,
    limit: number
  ): Promise<{ serviceProviders: ServiceProvider[]; total: number }> {
    const serviceProvidersList = await serviceProviderModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await serviceProviderModel.find().countDocuments();
    if (!serviceProvidersList) {
      throw new AppError("Failed to fetch ServiceProviders from database", 500);
    }
    return { serviceProviders: serviceProvidersList, total };
  }

  async getServiceProviderDetails(id: string): Promise<ServiceProvider | null> {
    const serviceProvidersDetails = await serviceProviderModel.findById(id);
    if (!serviceProvidersDetails) {
      throw new AppError("ServiceProviders not found", 404);
    }
    return serviceProvidersDetails;
  }

  async approveServiceProvider(serviceProviderId: string): Promise<boolean> {
    const serviceProvider = await serviceProviderModel.findByIdAndUpdate(
      { _id: serviceProviderId },
      { isApproved: true }
    );
    if (!serviceProvider) {
      throw new AppError("serviceProvider not found", 404);
    }
    return true;
  }

  async blockProvider(serviceProviderId: string): Promise<boolean> {
    const provider = await serviceProviderModel.findById(serviceProviderId);
    if (!provider) {
      throw new AppError("provider not found", 404);
    }
    await serviceProviderModel.findOneAndUpdate(
      { _id: serviceProviderId },
      { isBlocked: !provider.isBlocked }
    );
    return true;
  }

  async unlistCategory(categoryId: string): Promise<Category | null> {
    const category = await CategoryModel.findById(categoryId);
    if (!category) throw new AppError("category not found", 404);

    const categoryUnlist = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { isListed: !category.isListed },
      { new: true }
    );
    if (!categoryUnlist) {
      throw new AppError("Failed to unlist category", 500);
    }
    return categoryUnlist;
  }

  async addCategory(
    categoryName: string,
    subCategories: string[]
  ): Promise<boolean> {
    const newCategory = new CategoryModel({
      categoryName: categoryName,
      subCategories: subCategories,
    });
    const savedCategory = await newCategory.save();
    if (!savedCategory) {
      throw new AppError("Failed to add category in the database", 500);
    }
    return true;
  }

  async findAllCategories(
    page: number,
    limit: number
  ): Promise<{ categorys: Category[]; total: number }> {
    const categoryList = await CategoryModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await CategoryModel.find().countDocuments();
    if (!categoryList) {
      throw new AppError("Failed to fetch category from database", 500);
    }
    return { categorys: categoryList, total };
  }

  async addBlog(blogData: Partial<IBlog>): Promise<IBlog> {
 
    const blog = new BlogModel(blogData);
    console.log("blog", blog);

    await blog.save();
    return blog;
  }

  async listBlogs(
    page: number,
    limit: number
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const blogs = await BlogModel.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await BlogModel.countDocuments({});
    return { blogs, total };
  }

  // async unlistBlog(blogId: string): Promise<IBlog | null> {
  //   const blog = await BlogModel.findById(blogId);

  //   if (!blog) throw new AppError("blog not found", 404);
  //   const unlistBlog = await BlogModel.findByIdAndUpdate(
  //     blogId,
  //     { isListed: !blog.isListed },
  //     { new: true }
  //   );
  //   if (!unlistBlog) {
  //     throw new AppError("Failed to unlist blog", 500);
  //   }
  //   return unlistBlog;
  // }

  async unlistBlog(blogId: string) {
    if (!blogId) {
      throw new Error("Blog ID is required");
    }

    const blog = await BlogModel.findById(blogId);
    if (!blog) {
      throw new Error("Blog not found");
    }

    blog.isListed = false; // Example logic for unlisting
    return await blog.save();
  }

  async updateBlogStatus(blogId: string, isListed: boolean): Promise<IBlog> {
    try {
      const updatedBlog = await BlogModel.findByIdAndUpdate(
        blogId,
        { isListed },
        { new: true }
      ).exec();
      if (!updatedBlog) {
        throw new Error("Blog not found");
      }
      return updatedBlog;
    } catch (error) {
      throw new Error(`Error updating blog status: `);
    }
  }

  async addWebinar(webinar: IWebinar): Promise<IWebinar> {
    const newWebinar = new WebinarModel(webinar);
    console.log("hii:", newWebinar);

    return await newWebinar.save();
  }

  async listWebinars(): Promise<IWebinar[]> {
    return await WebinarModel.find({})
    .sort({ createdAt: -1 });
  }

  async unlistWebinar(webinarId: string): Promise<IWebinar | null> {
    return await WebinarModel.findOneAndUpdate(
      { webinarId: webinarId }, // Query by the custom field
      { isListed: false }, // Update operation
      { new: true } // Return the updated document
    );
  }

  async toggleWebinarListing(webinarId: string): Promise<IWebinar | null> {
    const webinar = await WebinarModel.findOne({ webinarId });
    if (!webinar) return null;

    webinar.isListed = !webinar.isListed;
    await webinar.save();
    return webinar;
  }
  async getAllComplaints(): Promise<any[]> {
    return await Complaint.find(); // Fetch all complaints from the database
  }

  async respondToComplaint(id: string, responseMessage: string): Promise<boolean> {
    try {
      const complaint = await Complaint.findById(id).sort({createdAt:-1});

      if (!complaint) {
        return false;
      }

      complaint.response = responseMessage;
      complaint.isResolved = true;
      await complaint.save();

      return true;
    } catch (error) {
      console.error('Error responding to complaint:', error);
      return false;
    }
  }


  async getAllBookings(page: number, limit: number): Promise<ScheduledBooking[]> {
    try {
      const skip = (page - 1) * limit;
      const bookings = await ScheduledBookingModel.find()
        .populate({
          path: 'serviceProviderId',
          select: 'name',
        })
        .populate({
          path: 'userId',
          select: 'name',
        })
        .sort({ createdAt: -1 })
        .skip(skip)  // Skip based on the page number
        .limit(limit) // Limit the number of bookings returned
        .exec();
  
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }



 async  dashboardDetails(): Promise<any> {
  const providersCount = await serviceProviderModel.countDocuments();
  const usersCount = await users.countDocuments();
  
  const bookings = await ScheduledBookingModel.aggregate([
    {
      $group: { _id: "$status", total: { $sum: 1 } },
    },
  ]);

  const bookingsCount = { completed: 0, scheduled: 0, cancelled: 0, refunded: 0 };

  bookings.forEach(int => {
    if (int._id === "Completed") {
      bookingsCount.completed = int.total;
    } else if (int._id === "Scheduled") {
      bookingsCount.scheduled = int.total;
    } else if (int._id === "Cancelled") {
      bookingsCount.cancelled = int.total;
    } else if (int._id === "Refunded") {
      bookingsCount.refunded = int.total;
    }
  });

  const scheduledBookings = await ScheduledBookingModel.find();

  return {
    providersCount,
    usersCount,
    bookingsCount,
    scheduledBookings,
  };
}
}

export default AdminRepository;
