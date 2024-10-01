import { Response, Request, NextFunction } from "express";
import ServiceProviderUseCase from "../../use-case/ServiceProviderUse-case";
import path from "path";
import fs from "fs";
import AppError from "../../infrastructure/utils/appError";
import ProviderSlot from "../../domain/entities/providerSlot";
import MailService from "../../infrastructure/utils/mailService";

interface Service {
  value: string;
  label: string;
}

class ServiceProviderController {
  constructor(private serviceProviderCase: ServiceProviderUseCase) {        this.emergencycancelBooking = this.emergencycancelBooking.bind(this);
  }

  async verifyServiceProviderEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, email } = req.body;
      const serviceProviderInfo = req.body;

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

      const response = await this.serviceProviderCase.findServiceProvider(
        serviceProviderInfo
      );
      if (response?.status === 200) {
        throw new AppError("Email already in use. Please log in or choose another", 400);
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, data: token });
      }
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new AppError("Unauthorized user", 401);

      const serviceProviderInfo =
        await this.serviceProviderCase.getServiceProviderInfoUsingToken(token);
      if (!serviceProviderInfo) throw new AppError("No user found", 400);

      const response = await this.serviceProviderCase.findServiceProvider(
        serviceProviderInfo
      );
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

      const serviceProvider =
        await this.serviceProviderCase.saveServiceProvider(token, otp);

      if (serviceProvider.success) {
        const { token } = serviceProvider.data;
        res.cookie("serviceProviderToken", token);
        return res
          .status(201)
          .json({ success: true, data: { token }, message: "OTP veified" });
      } else {
        throw new AppError("OTP not verified", 400);
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const serviceProvider =
        await this.serviceProviderCase.serviceProviderLogin(email, password);
      if (serviceProvider.success) {
        res.cookie("serviceProviderToken", serviceProvider.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true,
          secure: true, // use true if you're serving over https
          sameSite: "none", // allows cross-site cookie usage
        });
        res.status(200).json(serviceProvider);
      } else {
        throw new AppError(serviceProvider.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyDetails(req: Request, res: Response, next: NextFunction) {
    console.log("hlo");

    try {
      const {
        expYear,
        location,
        service,
        specialization,
        qualification,
        rate,
      } = req.body;
      console.log("request", expYear, req.body);
      const { profilePicture, experienceCrt } = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      if (!profilePicture || !experienceCrt) {
        throw new AppError("All files must be uploaded", 400);
      }

      console.log("files:", req.files);

      const serviceProvideDetails = {
        ...req.body,
        ...req.files,
        _id: req.serviceProviderId,
      };

      const serviceProviderId = req.serviceProviderId;
      const updatedServiceProvide =
        await this.serviceProviderCase.saveServiceProviderDetails(
          serviceProvideDetails
        );
      console.log("update:", updatedServiceProvide);

      if (updatedServiceProvide.success) {
        // TO REMOVE FILES FROM SERVER
        [profilePicture, experienceCrt].forEach((files) => {
          files.forEach((file) => {
            const filePath = path.join(
              __dirname,
              "../../infrastructure/public/images",
              file.filename
            );
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log("Error deleting the file from server", err);
              }
            });
          });
        });

        return res.status(200).json({
          success: true,
          message: "serviceProvider details verified successfully",
          data: updatedServiceProvide,
        });
      } else {
        throw new AppError(
          "serviceProvider not found or unable to update details",
          404
        );
      }
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.cookie("serviceProviderToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.serviceProviderCase.getAllCategories();
      return res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getProfileDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceProviderId = req.serviceProviderId;
      if (!serviceProviderId) throw new AppError("userId id not found", 400);
      const user = await this.serviceProviderCase.getProfileDetails(
        serviceProviderId
      );
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async addProviderSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, description, timeFrom, timeTo, title, price, services } =
        req.body.slotData;
      const Srvc: string[] = (services as Service[]).map(
        (option: Service) => option.value
      );
      const serviceProviderId = req.serviceProviderId;

      if (!serviceProviderId) {
        throw new AppError("Unauthorized user", 401);
      }

      const slotData: ProviderSlot = {
        serviceProviderId,
        slots: [
          {
            date: new Date(date),
            schedule: [
              {
                description,
                from: timeFrom,
                to: timeTo,
                title,
                status: "open",
                price,
                services: Srvc,
              },
            ],
          },
        ],
      };

      const slotAdded = await this.serviceProviderCase.addSlot(slotData);
      return res.status(201).json({
        success: true,
        data: slotAdded,
        message: "Slot added successfully",
      });
    } catch (error) {
      console.error("Error adding slot:", error);
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  }

  async getProviderSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const searchQuery = req.query.searchQuery
        ? (req.query.searchQuery as string)
        : "";
      const serviceProviderId = req.serviceProviderId;
      if (!serviceProviderId) {
        throw new AppError("Unauthorized user", 401);
      }

      const { slots, total } = await this.serviceProviderCase.getProviderSlots(
        serviceProviderId,
        page,
        limit,
        searchQuery
      );
      return res.status(200).json({
        success: true,
        data: slots,
        total,
        message: "Fetched booking slots list",
      });
    } catch (error) {
      next(error);
    }
  }

  async getDomains(req: Request, res: Response, next: NextFunction) {
    try {
      const domainsList = await this.serviceProviderCase.getDomains();
      return res.status(200).json({
        success: true,
        data: domainsList,
        message: "Fetched domains list",
      });
    } catch (error) {
      next(error);
    }
  }
  async getScheduledBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceProviderId = req.serviceProviderId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (!serviceProviderId) throw new AppError("Provider not found", 400);
      const { bookings, total } =
        await this.serviceProviderCase.getScheduledBookings(
          serviceProviderId,
          page,
          limit
        );
      return res.status(200).json({ success: true, data: bookings, total });
    } catch (error) {
      next(error);
    }
  }

  async updateWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceProviderId = req.serviceProviderId;
      console.log("provider", serviceProviderId);

      if (!serviceProviderId) throw new AppError("provider id not found", 400);

      const { amount, type } = req.body;
      if (!amount || !type)
        throw new AppError("amount and type are required", 400);
      const wallet = await this.serviceProviderCase.updateWallet(
        serviceProviderId,
        amount,
        type
      );
      return res.status(201).send({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceProviderId = req.serviceProviderId;
      console.log("dd", serviceProviderId);

      if (!serviceProviderId) throw new AppError("provider Id not found", 400);

      const data = await this.serviceProviderCase.getPaymentDashboard(
        serviceProviderId
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;
      console.log("Request:", bookingId, status);
      const updatedBooking = await this.serviceProviderCase.updateBookingStatus(
        bookingId,
        status
      );
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.status(200).json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res
        .status(500)
        .json({ message: "Failed to update booking status", error });
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      console.log(email);
      const token = await this.serviceProviderCase.passwordReset(email);
      if (!token) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      return res.status(200).json({ success: true, data: token });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      if (!token) throw new AppError("Unauthorised user", 401);

      const { otp, password } = req.body;
      await this.serviceProviderCase.resetPassword(otp, password, token);
      return res
        .status(201)
        .json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }

  async editSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { slotId } = req.params;
      const updatedSlotData = req.body;
      const result = await this.serviceProviderCase.editSlot(
        slotId,
        updatedSlotData
      );
      res
        .status(200)
        .json({ message: "Slot updated successfully", updatedSlot: result });
    } catch (error) {
      console.error("Error updating slot:", error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        next(new AppError("Error updating slot", 500));
      }
    }
  }

  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      const { details } = req.body;
      const serviceProviderId = req.serviceProviderId;
      if (!serviceProviderId)
        throw new AppError("Interviewer id not found", 400);
      if (!details) throw new AppError("Details not provided", 400);

      await this.serviceProviderCase.editProfile(serviceProviderId, details);
      return res
        .status(200)
        .json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  async editPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceProviderId = req.serviceProviderId;
      const { currentPassword, newPassword } = req.body;
      if (!serviceProviderId)
        throw new AppError("interviewer id not found", 400);
      await this.serviceProviderCase.editPassword(
        serviceProviderId,
        currentPassword,
        newPassword
      );
      return res
        .status(200)
        .send({ success: true, message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getProviderDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = req.serviceProviderId;

      if (!providerId) {
        return res
          .status(400)
          .json({ message: "Service provider ID is missing" });
      }

      const dashboardData =
        await this.serviceProviderCase.getProviderDashboardData(providerId);
      return res.status(200).json(dashboardData);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to get dashboard data", error });
    }
  }

  async emergencycancelBooking (req: Request, res: Response)  {
    try {
        const { bookingId } = req.params;
        const { cancelReason } = req.body;
        
        console.log('bbbbb', bookingId, cancelReason);
        console.log('About to call cancelBookingUseCase');
        
        const result = await this.serviceProviderCase.cancelBookingUseCase(bookingId, cancelReason);
        
        const mailService = new MailService();
        await mailService.sendLeaveMail(
            result.user.name,
            result.user.email,
            cancelReason
        );
        
        return res.status(200).json({ message: 'Booking canceled successfully', result });
    } catch (error) {
        console.log('Error in EmergencycancelBooking:', error);
        return res.status(500).json({ message: 'Cancellation failed', error });
    }
};

}

export default ServiceProviderController;
