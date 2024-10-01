import ServiceProvider from "../../domain/entities/serviceProvider";
import IServiceProviderRepository from "../../interfaces/repositories/IServiceProviderRepository";
import { serviceProviderModel } from "../database/serviceProviderModel";
import AppError from "../utils/appError";
import Category from "../../domain/entities/category";
import { CategoryModel } from "../database/categoryModel";
import { ProviderSlotModel } from "../database/providerSlotModel";
import ScheduledBooking from "../../domain/entities/scheduledBookings";
import { ScheduledBookingModel } from "../database/scheduledBookingsModel";
import { WalletModel } from "../database/walletModel";
import users from "../database/userModel";

import ProviderSlot, {
  Slot,
  Schedule,
} from "../../domain/entities/providerSlot";

class ServiceProviderRepository implements IServiceProviderRepository {
  async findByEmail(email: string): Promise<ServiceProvider | null> {
    const serviceProviderFound = await serviceProviderModel.findOne({
      email: email,
    });
    return serviceProviderFound;
  }

  async saveServiceProvider(
    serviceProvider: ServiceProvider
  ): Promise<ServiceProvider | null> {
    const newServiceProvider = new serviceProviderModel(serviceProvider);
    const savedServiceProvider = await newServiceProvider.save();
    if (!savedServiceProvider) {
      throw new AppError("Failed to save service provider", 500);
    }
    return savedServiceProvider;
  }

  async findServiceProviderById(id: string): Promise<ServiceProvider | null> {
    const serviceProviderData = await serviceProviderModel.findById(id);
    if (!serviceProviderData) {
      throw new AppError("Service provider not found", 404);
    }
    return serviceProviderData;
  }

  async saveServiceProviderDetails(
    serviceProviderDetails: ServiceProvider
  ): Promise<ServiceProvider | null> {
    const updatedServiceProvider = await serviceProviderModel.findByIdAndUpdate(
      serviceProviderDetails._id,
      serviceProviderDetails,
      { new: true }
    );
    return updatedServiceProvider || null;
  }

  async findById(id: string): Promise<ServiceProvider | null> {
    const serviceProvider = await serviceProviderModel.findById(id);
    if (!serviceProvider) {
      throw new AppError("Service provider not found", 404);
    }
    return serviceProvider;
  }

  async getAllCategories(): Promise<string[]> {
    const categories = await CategoryModel.find({ isListed: true }).select(
      "categoryName"
    );
    return categories.map((category) => category.categoryName);
  }

  async saveProviderSlot(slotData: ProviderSlot): Promise<ProviderSlot | null> {
    const { serviceProviderId, slots } = slotData;

    const transformData = (
      data: any[],
      serviceProviderId: string
    ): ProviderSlot => {
      const slots: Slot[] = data.map((item) => ({
        date: new Date(item.date),
        schedule: item.schedule.map((scheduleItem: Schedule) => ({
          description: scheduleItem.description,
          from: new Date(scheduleItem.from),
          to: new Date(scheduleItem.to),
          title: scheduleItem.title,
          status: scheduleItem.status as "open" | "booked",
          price: Number(scheduleItem.price),
          services: scheduleItem.services,
        })),
      }));
      return { serviceProviderId, slots };
    };
    const transformedData = transformData(slots, serviceProviderId);

    let providerSlot = await ProviderSlotModel.findOne({ serviceProviderId });

    if (!providerSlot) {
      providerSlot = new ProviderSlotModel(transformedData);
    } else {
      transformedData.slots.forEach((newSlot) => {
        const existingSlotIndex = providerSlot!.slots.findIndex(
          (slot) =>
            slot.date?.toISOString().split("T")[0] ===
            newSlot.date?.toISOString().split("T")[0]
        );

        if (existingSlotIndex === -1) {
          providerSlot?.slots.push(newSlot);
        } else {
          newSlot.schedule.forEach((newSchedule) => {
            const existingScheduleIndex = providerSlot?.slots[
              existingSlotIndex
            ].schedule.findIndex(
              (s) => newSchedule.from < s.to && newSchedule.to > s.from
            );

            if (existingScheduleIndex === -1) {
              providerSlot?.slots[existingSlotIndex].schedule.push(newSchedule);
            } else {
              throw new AppError("Time slot already taken", 400);

              providerSlot!.slots[existingSlotIndex].schedule[
                existingScheduleIndex!
              ] = newSchedule;
            }
          });
        }
      });
    }

    const savedSlot = await providerSlot.save();
    return savedSlot;
  }

  async getProviderSlots(
    serviceProviderId: string,
    page: number,
    limit: number,
    searchQuery: string
  ): Promise<{ slots: ProviderSlot[]; total: number }> {
    const pipeline: any[] = [
      {
        $match: { serviceProviderId: serviceProviderId.toString() },
      },
      {
        $unwind: "$slots",
      },
    ];

    if (searchQuery) {
      pipeline.push({
        $match: {
          $or: [
            { "slots.schedule.title": { $regex: searchQuery, $options: "i" } },
            {
              "slots.schedule.services": {
                $elemMatch: { $regex: searchQuery, $options: "i" },
              },
            },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          _id: "$slots._id",
          date: "$slots.date",
          schedule: "$slots.schedule",
        },
      },
      {
        $sort: { date: -1 },
      }
    );

    const totalPipeline = [...pipeline, { $count: "total" }];
    const [totalResult] = await ProviderSlotModel.aggregate(totalPipeline);
    const total = totalResult ? totalResult.total : 0;

    pipeline.push(
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      }
    );

    const slots = await ProviderSlotModel.aggregate(pipeline);

    return { slots, total };
  }

  async getDomains(): Promise<Category[] | null> {
    const domainList = await CategoryModel.find({ isListed: true });
    if (!domainList) throw new AppError("Domains not found!", 400);
    return domainList;
  }

  async getScheduledBookings(
    serviceProviderId: string,
    page: number,
    limit: number
  ): Promise<{ bookings: ScheduledBooking[]; total: number }> {
    const list = await ScheduledBookingModel.find({
      serviceProviderId: serviceProviderId,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ScheduledBookingModel.find({
      serviceProviderId,
    }).countDocuments();

    if (!list) throw new AppError("Bookings are not scheduled", 404);

    return { bookings: list, total };
  }

  async getPaymentDashboard(serviceProviderId: string): Promise<any> {
    const bookings = await ScheduledBookingModel.aggregate([
      {
        $match: { serviceProviderId: serviceProviderId.toString() },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: { $toObjectId: "$userId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
          ],
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: { "user.password": 0, "user.email": 0, "user.mobile": 0 },
      },
    ]);

    const totalEarnings = await ScheduledBookingModel.aggregate([
      {
        $match: { serviceProviderId: serviceProviderId.toString() },
      },
      {
        $group: { _id: null, total: { $sum: "$price" } },
      },
    ]);

    const wallet = await WalletModel.findOne({
      ownerId: serviceProviderId,
      ownerType: "serviceProvider",
    });
    console.log("wllt", wallet);

    const totalRevenue = totalEarnings[0]?.total;
    console.log("revenue", totalRevenue);

    return { bookings, totalRevenue, wallet };
  }

  async getScheduledBookingByRoomId(
    roomId: string
  ): Promise<ScheduledBooking | null> {
    const interview = await ScheduledBookingModel.findOne({ roomId: roomId });
    return interview;
  }

  async updatePassword(
    serviceProviderId: string,

    password: string
  ): Promise<void | null> {
    await serviceProviderModel.findByIdAndUpdate(serviceProviderId, {
      password: password,
    });
  }
  async findProviderSlot(slotId: string) {
    return await ProviderSlotModel.findOne({ "slots._id": slotId });
  }

  async saveProviderSlots(providerSlot: any) {
    return await providerSlot.save();
  }

  async updateStatus(bookingId: string, status: string) {
    console.log("hi", bookingId, status);

    return await ScheduledBookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true } // Return the updated document
    );
  }

  async editProfile(
    interviewerId: string,
    details: ServiceProvider
  ): Promise<void> {
    const { name, mobile, location, service, expYear, qualification } = details;
    await serviceProviderModel.findByIdAndUpdate(interviewerId, {
      name,
      mobile,
      location,
      service,
      expYear,
      qualification,
    });
  }

  async getDashboardStats(providerId: string) {
    const totalBookings = await ScheduledBookingModel.countDocuments({
      serviceProviderId: providerId,
    });
    const scheduledBookings = await ScheduledBookingModel.countDocuments({
      serviceProviderId: providerId,
      status: "Scheduled",
    });
    const completedBookings = await ScheduledBookingModel.countDocuments({
      serviceProviderId: providerId,
      status: "Completed",
    });
    const canceledBookings = await ScheduledBookingModel.countDocuments({
      serviceProviderId: providerId,
      status: "Cancelled",
    });
    const refundedBookings = await ScheduledBookingModel.countDocuments({
      serviceProviderId: providerId,
      status: "Refunded",
    });

    const bookings = await ScheduledBookingModel.find({
      serviceProviderId: providerId,
      status: { $in: ["Completed", "Scheduled"] },
    }).select("date status price");

    const totalRevenue = bookings.reduce(
      (total, booking) => total + booking.price,
      0
    );

    return {
      totalBookings,
      scheduledBookings,
      completedBookings,
      canceledBookings,
      refundedBookings,
      totalRevenue,
      bookings,
    };
  }

  async findBookingById(bookingId: string): Promise<any> {
    console.log("Inside findBookingById:", bookingId);

    const booking = await ScheduledBookingModel.findById(bookingId);
    console.log("Booking retrieved:", booking);
    return booking;
  }

  async cancelBooking(bookingId: string, cancelReason: string): Promise<any> {
    console.log("Inside cancelBooking:", bookingId, cancelReason);

    const booking = await ScheduledBookingModel.findById(bookingId);
    if (!booking) {
      console.log("Booking not found during cancellation");
      throw new Error("Booking not found");
    }

    booking.status = "Refunded";
    booking.EmergencyLeaveReason = cancelReason;
    booking.EmergencyLeaveDate = new Date();

    await booking.save();
    const user = await users.findById(booking.userId);
    if (!user) throw new Error("User not found"); // Ensure user exists

    // Return both the cancelled booking and the user details
    return {
      booking,
      user: {
        name: user.name,
        email: user.email,
      },
    };
  }
}
export default ServiceProviderRepository;
