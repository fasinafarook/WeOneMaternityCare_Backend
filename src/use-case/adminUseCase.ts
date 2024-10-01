

import Admin from "../domain/entities/admin";
import AppError from "../infrastructure/utils/appError";
import IAdminRepository from "../interfaces/repositories/IAdminRepository";
import IJwtToken from "../interfaces/utils/IJwtToken";
import IMailService from "../interfaces/utils/IMailService";
import { IBlog } from "../domain/entities/blog";
import IFileStorageService from "../interfaces/utils/IFileStorageService";
import { IWebinar } from "../domain/entities/webinars";
import { IComplaint } from "../domain/entities/complaint";

class AdminUseCase {
  constructor(
    public iAdminRepository: IAdminRepository,
    private jwtToken: IJwtToken,
    private mailService: IMailService,
    private fileStorageService: IFileStorageService // Add fileStorageService here
  ) {}

  async adminLogin(email: string, password: string) {
    // Get credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new AppError(
        "Admin credentials are not set in environment variables",
        500
      );
    }

    if (email !== adminEmail) {
      throw new AppError("Invalid Email", 400);
    }

    if (password !== adminPassword) {
      throw new AppError("Invalid Password", 401);
    }

    const token = this.jwtToken.createJwtToken(
      "adminIdPlaceholder", // Replace with actual admin ID if needed
      "admin"
    );

    return { success: true, adminData: "adminIdPlaceholder", token };
  }

  async getAllUsers(page: number, limit: number) {
    const { users, total } = await this.iAdminRepository.findAllUsers(
      page,
      limit
    );
    return { users, total };
  }

  async blockUser(userId: string) {
    const userBlocked = await this.iAdminRepository.blockUser(userId);
    return userBlocked;
  }

  async getAllServiceProviders(page: number, limit: number) {
    const { serviceProviders, total } =
      await this.iAdminRepository.findAllServiceProviders(page, limit);
    return { serviceProviders, total };
  }

  async ServiceProviderDetails(id: string) {
    const serviceProviderDetails =
      await this.iAdminRepository.getServiceProviderDetails(id);
    return serviceProviderDetails;
  }

  async approveServiceProvider(serviceProviderId: string) {
    const serviceProviderApproved =
      await this.iAdminRepository.approveServiceProvider(serviceProviderId);
    return serviceProviderApproved;
  }
  async blockProvider(serviceProviderId: string) {
    const providerBlocked = await this.iAdminRepository.blockProvider(
      serviceProviderId
    );
    return providerBlocked;
  }

  async unlistCategory(categoryId: string) {
    const categoryUnlist = await this.iAdminRepository.unlistCategory(
      categoryId
    );
    return categoryUnlist;
  }

  async addCategory(categoryName: string, subCategories: string[]) {
    const categoryAdded = await this.iAdminRepository.addCategory(
      categoryName,
      subCategories
    );
    if (categoryAdded) {
      return { success: true, message: "Category added successfully" };
    }
    throw new AppError("Failed to add Category", 400);
  }

  async findAllCategories(page: number, limit: number) {
    const { categorys, total } = await this.iAdminRepository.findAllCategories(
      page,
      limit
    );
    return { categorys, total };
  }

  async addBlog(blogData: Partial<IBlog>, file: any): Promise<IBlog> {
    console.log("data:", blogData, "file:", file);

    // Upload the image to Cloudinary
    const imageUrl = await this.fileStorageService.uploadFiles(file, "image");
    console.log(imageUrl);

    blogData.image = imageUrl;

    const blog = await this.iAdminRepository.addBlog(blogData);
    return blog;
  }

  async listBlogs(page: number, limit: number) {
    const { blogs, total } = await this.iAdminRepository.listBlogs(page, limit);
    return { blogs, total };
  }

  async unlistBlog(blogId: string) {
    if (!blogId) {
      throw new Error("Blog ID is required");
    }
    return await this.iAdminRepository.unlistBlog(blogId);
  }
  async updateBlogStatus(blogId: string, isListed: boolean): Promise<IBlog> {
    try {
      return await this.iAdminRepository.updateBlogStatus(blogId, isListed);
    } catch (error) {
      throw new Error(`Error in use case: `);
    }
  }

  async addWebinar(
    webinarData: Omit<IWebinar, "webinarId" | "createdAt">,
    files: any
  ): Promise<IWebinar> {
    console.log("data:-", webinarData, "fil:", files);
    const thumbnailFile = files.thumbnail[0];
    const videoFile = files.video[0];
    const thumbnailUrl = await this.fileStorageService.uploadFiles(
      thumbnailFile,
      "webinars/thumbnails"
    );
    const videoUrl = await this.fileStorageService.uploadFiles(
      videoFile,
      "webinars/videos"
    );
    console.log("Thumbnail URL:", thumbnailUrl, "Video URL:", videoUrl);

    const webinar: IWebinar = {
      ...webinarData,
      webinarId: new Date().valueOf().toString(),
      createdAt: new Date(),
      thumbnail: thumbnailUrl,
      videoUrl: videoUrl,
      isListed: true,
    };

    return await this.iAdminRepository.addWebinar(webinar);
  }

  async listWebinars(): Promise<IWebinar[]> {
    return await this.iAdminRepository.listWebinars();
  }

  async unlistWebinar(webinarId: string): Promise<IWebinar | null> {
    return await this.iAdminRepository.unlistWebinar(webinarId);
  }

  async toggleWebinarListing(webinarId: string): Promise<IWebinar | null> {
    return this.iAdminRepository.toggleWebinarListing(webinarId);
  }

  async getAllComplaints() {
    return await this.iAdminRepository.getAllComplaints();
  }

  async respondToComplaint(id: string, responseMessage: string): Promise<boolean> {
    return this.iAdminRepository.respondToComplaint(id, responseMessage);
  }
  
  async getAdminBookingsUseCase(page: number, limit: number) {
    const bookings = await this.iAdminRepository.getAllBookings(page, limit);
    return bookings;
  }
  
  async getDashboardDetails() {
    const details = await this.iAdminRepository.dashboardDetails()
    return details
  }

}
export default AdminUseCase;
