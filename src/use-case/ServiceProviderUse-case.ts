import ServiceProvider from "../domain/entities/serviceProvider";
import IServiceProviderRepository from "../interfaces/repositories/IServiceProviderRepository";
import IGenerateOtp from "../interfaces/utils/IGenerateOtp";
import IJwtToken from "../interfaces/utils/IJwtToken";
import IMailService from "../interfaces/utils/IMailService";
import IHashPassword from "../interfaces/utils/IhashPassword";
import AppError from "../infrastructure/utils/appError";
import IFileStorageService from "../interfaces/utils/IFileStorageService";
import ProviderSlot from "../domain/entities/providerSlot";
import IWalletRepository from "../interfaces/repositories/IWalletRepository";

type DecodedToken = {
  info: { userId: string };
  otp: string;
  iat: number;
  exp: number;
};

class ServiceProviderUseCase {
  constructor(
    private iServiceProviderRepository: IServiceProviderRepository,
    private otpGenerate: IGenerateOtp,
    private jwtToken: IJwtToken,
    private mailService: IMailService,
    private hashPassword: IHashPassword,
    private fileStorageService: IFileStorageService,
    private iWalletRepository: IWalletRepository
  ) {}
  async findServiceProvider(serviceProviderInfo: ServiceProvider) {
    const serviceProviderFound =
      await this.iServiceProviderRepository.findByEmail(
        serviceProviderInfo.email
      );
    if (serviceProviderFound) {
      return {
        status: 200,
        data: serviceProviderFound,
        message: "serviceProvider found",
      };
    } else {
      console.log(serviceProviderInfo.email);
      const otp: string = this.otpGenerate.generateOtp();
      console.log("OTP: ", otp);
      const token = this.jwtToken.otpToken(serviceProviderInfo, otp);
      const { name, email } = serviceProviderInfo;
      await this.mailService.sendMail(name, email, otp);
      return { status: 201, data: token, message: "OTP generated and sent" };
    }
  }

  async getServiceProviderInfoUsingToken(token: string) {
    const decodedToken = this.jwtToken.verifyJwtToken(token);
    console.log("token", decodedToken);

    if (!decodedToken) {
      throw new AppError("Invalid Token", 400);
    }
    return decodedToken.info;
  }

  async saveServiceProvider(token: string, otp: string) {
    let decodedToken = this.jwtToken.verifyJwtToken(token);
    console.log("vka", decodedToken);

    if (!decodedToken) {
      throw new AppError("Invalid Token", 400);
    }

    if (otp !== decodedToken.otp) {
      throw new AppError("Invalid OTP", 401);
    }

    const { password } = decodedToken.info;
    const hashedPassword = await this.hashPassword.hash(password);
    decodedToken.info.password = hashedPassword;

    const serviceProviderSave =
      await this.iServiceProviderRepository.saveServiceProvider(
        decodedToken.info
      );

    if (!serviceProviderSave) {
      throw new AppError("Failed to save serviceProvider", 500);
    }

    // Create a wallet for the new Service Provider
    const newWallet = await this.iWalletRepository.createWallet(
      serviceProviderSave._id as string,
      "serviceProvider"
    );

    let newToken = this.jwtToken.createJwtToken(
      serviceProviderSave._id as string,
      "serviceProvider"
    );
    return { success: true, data: { token: newToken } };
  }

  async serviceProviderLogin(email: string, password: string) {
    const serviceProviderFound =
      await this.iServiceProviderRepository.findByEmail(email);

    if (!serviceProviderFound) {
      throw new AppError("serviceProvider not found!", 404);
    }

    const passwordMatch = await this.hashPassword.compare(
      password,
      serviceProviderFound.password
    );
    if (!passwordMatch) {
      throw new AppError("Wrong password", 401);
    }

    if (serviceProviderFound.isBlocked) {
      throw new AppError("You are blocked by admin", 403);
    }

    let token = this.jwtToken.createJwtToken(
      serviceProviderFound._id,
      "serviceProvider"
    );
    console.log("klk", token);

    return {
      success: true,
      data: {
        token: token,
        hasCompletedDetails: serviceProviderFound.hasCompletedDetails,
        isApproved: serviceProviderFound.isApproved,
      },
      message: "serviceProvider found",
    };
  }
  async saveServiceProviderDetails(serviceProviderDetails: ServiceProvider) {
    const { _id, profilePicture, experienceCrt } = serviceProviderDetails;
    console.log("fil:", profilePicture, "crt", experienceCrt);

    const serviceProvider =
      await this.iServiceProviderRepository.findServiceProviderById(_id);
    if (!serviceProvider) {
      throw new AppError("serviceProvider not found!", 404);
    }

    const profilePictureUrl = await this.fileStorageService.uploadFile(
      profilePicture,
      "profilePictures"
    );

    const experienceCrtUrl = await this.fileStorageService.uploadFile(
      experienceCrt,
      "experienceCrt"
    );

    serviceProviderDetails.profilePicture = profilePictureUrl;
    serviceProviderDetails.experienceCrt = experienceCrtUrl;
    serviceProviderDetails.hasCompletedDetails = true;
    console.log(
      "rr",
      serviceProviderDetails.profilePicture,
      "fff",
      serviceProviderDetails.experienceCrt
    );

    const updatedServiceProvider =
      await this.iServiceProviderRepository.saveServiceProviderDetails(
        serviceProviderDetails
      );

    if (!updatedServiceProvider) {
      throw new AppError("Failed to update serviceProvider details", 500);
    }

    return {
      success: true,
      message: "serviceProvider details updated successfully!",
      data: updatedServiceProvider,
    };
  }

  async getAllCategories() {
    return await this.iServiceProviderRepository.getAllCategories();
  }

  async getProfileDetails(userId: string) {
    const user = await this.iServiceProviderRepository.findServiceProviderById(
      userId
    );
    return user;
  }

  async addSlot(slotData: ProviderSlot) {
    const { serviceProviderId, slots } = slotData;
    if (
      !serviceProviderId ||
      !slots ||
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      throw new AppError("Invalid slot data", 400);
    }
    const slotAdded = await this.iServiceProviderRepository.saveProviderSlot(
      slotData
    );
    return slotAdded;
  }

  async getProviderSlots(
    serviceProviderId: string,
    page: number,
    limit: number,
    searchQuery: string
  ) {
    const { slots, total } =
      await this.iServiceProviderRepository.getProviderSlots(
        serviceProviderId,
        page,
        limit,
        searchQuery
      );
    return { slots, total };
  }

  async getDomains() {
    const domainList = await this.iServiceProviderRepository.getDomains();
    return domainList;
  }

  async getScheduledBookings(
    serviceProviderId: string,
    page: number,
    limit: number
  ) {
    const { bookings, total } =
      await this.iServiceProviderRepository.getScheduledBookings(
        serviceProviderId,
        page,
        limit
      );
    return { bookings, total };
  }

  async updateWallet(
    serviceProviderId: string,
    amount: number,
    type: "credit" | "debit"
  ) {
    const wallet = await this.iWalletRepository.updateWallet(
      serviceProviderId,
      amount,
      type
    );
    return wallet;
  }

  async getPaymentDashboard(serviceProviderId: string) {
    const details = await this.iServiceProviderRepository.getPaymentDashboard(
      serviceProviderId
    );
    return details;
  }

  async editSlot(slotId: string, updatedSlotData: any) {
    const providerSlot = await this.iServiceProviderRepository.findProviderSlot(
      slotId
    );

    if (!providerSlot) {
      throw new AppError("Slot not found in any provider", 404);
    }

    const slotIndex = providerSlot.slots.findIndex(
      (s: any) => s._id.toString() === slotId
    );

    if (slotIndex === -1) {
      throw new AppError("Slot not found", 404);
    }

    const newFrom = new Date(updatedSlotData.from);
    const newTo = new Date(updatedSlotData.to);
    const slotDate = newFrom.toISOString().split("T")[0];

    const isDuplicateTimeOnSameDay = providerSlot.slots.some(
      (slot: any, index: number) => {
        if (index !== slotIndex) {
          return slot.schedule.some((schedule: any) => {
            const existingFrom = new Date(schedule.from);
            const existingTo = new Date(schedule.to);
            const existingDate = existingFrom.toISOString().split("T")[0];

            if (existingDate === slotDate) {
              const isOverlapping =
                (newFrom <= existingTo && newTo >= existingFrom) ||
                (newFrom >= existingFrom && newFrom < existingTo) ||
                (newTo > existingFrom && newTo <= existingTo) ||
                (newFrom <= existingFrom && newTo >= existingTo);
              return isOverlapping;
            }

            return false;
          });
        }
        return false;
      }
    );

    if (isDuplicateTimeOnSameDay) {
      throw new AppError("Slot time already exists on the same date", 400);
    }

    const updatedSlot = providerSlot.slots[slotIndex];
    updatedSlot.schedule.forEach((schedule: any) => {
      schedule.from = updatedSlotData.from || schedule.from;
      schedule.to = updatedSlotData.to || schedule.to;
      schedule.price = updatedSlotData.price || schedule.price;
      schedule.services = updatedSlotData.services || schedule.services;
      schedule.description =
        updatedSlotData.description || schedule.description;
      schedule.status = updatedSlotData.status || schedule.status;
    });

    await this.iServiceProviderRepository.saveProviderSlots(providerSlot);
    return updatedSlot;
  }

  async passwordReset(email: string) {
    try {
      const candidate = await this.iServiceProviderRepository.findByEmail(
        email
      );
      if (!candidate) {
        return null;
      }
      const { name } = candidate;
      const otp = this.otpGenerate.generateOtp();
      const hashedOtp = await this.hashPassword.hash(otp);
      console.log("FORGOT PASSWORD OTP: ", otp);
      const token = this.jwtToken.otpToken(
        { userId: candidate._id },
        hashedOtp
      );

      await this.mailService.sendMail(name, email, otp);

      return token;
    } catch (error) {
      throw new AppError("Failed to initiate password reset", 500);
    }
  }

  async resetPassword(UserOtp: string, password: string, token: any) {
    const decodedToken = this.jwtToken.verifyJwtToken(token) as DecodedToken;
    const { otp, info } = decodedToken;
    const { userId } = info;

    const isOtpValid = await this.hashPassword.compare(UserOtp, otp);
    if (!isOtpValid) {
      throw new AppError("Incorrect OTP", 400);
    }
    const hashedPassword = await this.hashPassword.hash(password);

    await this.iServiceProviderRepository.updatePassword(
      userId,
      hashedPassword
    );

    return;
  }

  async updateBookingStatus(bookingId: string, status: string) {
    console.log("Service Call:", bookingId, status);

    const validStatuses = ["Scheduled", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    return await this.iServiceProviderRepository.updateStatus(
      bookingId,
      status
    );
  }

  async editProfile(serviceProviderId: string, details: ServiceProvider) {
    await this.iServiceProviderRepository.editProfile(
      serviceProviderId,
      details
    );
  }

  async editPassword(
    serviceProviderId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const serviceProvider =
      await this.iServiceProviderRepository.findServiceProviderById(
        serviceProviderId
      );
    if (!serviceProvider) throw new AppError("Interviewer not found ", 400);
    const isPasswordMatch = await this.hashPassword.compare(
      oldPassword,
      serviceProvider?.password
    );
    if (!isPasswordMatch)
      throw new AppError(
        "Current password is incorrect. Please check and try again.",
        400
      );

    const hashedPassword = await this.hashPassword.hash(newPassword);
    await this.iServiceProviderRepository.updatePassword(
      serviceProviderId,
      hashedPassword
    );
  }

  async getProviderDashboardData(providerId: string) {
    // Get total bookings, scheduled, completed, canceled, refunded, and revenue
    const dashboardData =
      await this.iServiceProviderRepository.getDashboardStats(providerId);
    return dashboardData;
  }

  async cancelBookingUseCase(bookingId: string, cancelReason: string) {
    console.log("Inside cancelBookingUseCase:", bookingId, cancelReason);

    try {
      console.log("Fetching booking by ID:", bookingId);

      const booking = await this.iServiceProviderRepository.findBookingById(
        bookingId
      );
      if (!booking) {
        console.log("Booking not found");
        throw new Error("Booking not found");
      }

      console.log("Booking found:", booking);

      const cancelledBooking =
        await this.iServiceProviderRepository.cancelBooking(
          bookingId,
          cancelReason
        );
      console.log("Booking cancelled:", cancelledBooking);
      return cancelledBooking;
    } catch (error) {
      console.log("Error occurred in cancelBookingUseCase:", error);
      throw error;
    }
  }
}

export default ServiceProviderUseCase;
