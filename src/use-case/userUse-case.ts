
import { NextFunction } from "express";

import User from "../domain/entities/user";
import IUserRepository from "../interfaces/repositories/IUserRepository";
import IGenerateOtp from "../interfaces/utils/IGenerateOtp";
import IJwtToken from "../interfaces/utils/IJwtToken";
import IMailService from "../interfaces/utils/IMailService";
import IHashPassword from "../interfaces/utils/IhashPassword";
import AppError from "../infrastructure/utils/appError";
import ServiceProvider from "../domain/entities/serviceProvider";
import { IWebinar } from "../domain/entities/webinars";
import IWalletRepository from "../interfaces/repositories/IWalletRepository";

type DecodedToken = {
  info: { userId: string };
  otp: string;
  iat: number;
  exp: number;
}

class UserUseCase {
  constructor(
    private iUserRepository: IUserRepository,
    private otpGenerate: IGenerateOtp,
    private jwtToken: IJwtToken,
    private mailService: IMailService,
    private hashPassword: IHashPassword,
    private iWalletRepository: IWalletRepository

  ) {}

  
  async findUser(userInfo: User) {
    const userFound = await this.iUserRepository.findByEmail(
      userInfo.email
    );
    if (userFound) {
      return {
        status: 200,
        data: userFound,
        message: "user found",
      };
    } else {
      console.log(userInfo.email)
      const otp: string = this.otpGenerate.generateOtp();
      console.log("OTP: ", otp);
      const token = this.jwtToken.otpToken(userInfo, otp);
      const { name, email } = userInfo;
      await this.mailService.sendMail(name, email, otp);
      return { status: 201, data: token, message: "OTP generated and sent" };
    }
  }

  async getUserInfoUsingToken(token: string) {
    const decodedToken = this.jwtToken.verifyJwtToken(token);
    if (!decodedToken) {
      throw new AppError("Invalid Token", 400);
    }
    return decodedToken.info;
  }

  async saveUser(token: string, otp: string) {
    let decodedToken = this.jwtToken.verifyJwtToken(token);

    if (!decodedToken) {
      throw new AppError("Invalid Token", 400);
    }

    if (otp !== decodedToken.otp) {
      throw new AppError("Invalid OTP", 401);
    }

    const { password } = decodedToken.info;
    const hashedPassword = await this.hashPassword.hash(password);
    decodedToken.info.password = hashedPassword;

    const userSave = await this.iUserRepository.saveUser(
      decodedToken.info
    );

    if (!userSave) {
      throw new AppError("Failed to save user", 500);
    }
    const newWallet = await this.iWalletRepository.createWallet(userSave._id as string, 'user');

    let newToken = this.jwtToken.createJwtToken(
      userSave._id as string,
      "user"
    );
    return { success: true, token: newToken };
  }

  async userLogin(email: string, password: string) {
    const userFound = await this.iUserRepository.findByEmail(email);

    if (!userFound) {
      throw new AppError("User not found!", 404);
    }
    const passwordMatch = await this.hashPassword.compare(
      password,
      userFound.password
    );

    if (!passwordMatch) {
      throw new AppError("Wrong password", 401);
    }

    if (userFound.isBlocked) {
      throw new AppError("You are blocked by admin", 403);
    }

    let token = this.jwtToken.createJwtToken(userFound._id, "user");

    return {
      success: true,
      data: { token: token },
      message: "user found",
    };
  }

  async getProfileDetails(userId: string) {
    const user = await this.iUserRepository.findUserById(userId);
    return user
  }

  async editProfile(userId: string, name: string, mobile: number) {
    
    await this.iUserRepository.editProfile(userId, name, mobile)
  }

  async editPassword(userId: string, oldPassword: string,  newPassword: string) {
    
    const user = await this.iUserRepository.findUserById(userId);
    if(!user) throw new AppError("User not found ", 400)
    const isPasswordMatch = await this.hashPassword.compare(oldPassword, user?.password)
    if(!isPasswordMatch) throw new AppError("Current password is incorrect. Please check and try again.", 400)
    
    const hashedPassword = await this.hashPassword.hash(newPassword)
    await this.iUserRepository.updatePassword(userId, hashedPassword)
  }

  async getApprovedAndUnblockedProviders(): Promise<ServiceProvider[]> {
    return this.iUserRepository.getApprovedAndUnblockedProviders();
}

async ServiceProviderDetails(id: string) {
  const serviceProviderDetails =
    await this.iUserRepository.getServiceProviderDetails(id);
  return serviceProviderDetails;
}




getProviderSlotDetails(serviceProviderId: string) {
  const details = this.iUserRepository.getProviderSlotDetails(
    serviceProviderId,
  );
  return details;
}


async getScheduledBookingList(userId: string, page: number, limit: number) {
  try {
    const {bookings, total} =
      await this.iUserRepository.getScheduledBookings(userId, page, limit);
    return {bookings, total};
  } catch (error) {
    throw new AppError("Failed to fetch scheduled bookings", 500);
  }
}

async getListedWebinars(): Promise<IWebinar[]> {
  return this.iUserRepository.getListedWebinars();
}

async getListedBlogs(page: number, limit: number) {
  return this.iUserRepository.getListedBlogs(page, limit);
}

async getWallet(userId: string) {

  const details = await this.iUserRepository.getWallet(userId)
  return details
}

}

export default UserUseCase;

