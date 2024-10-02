import Admin from "../../domain/entities/admin";
import IUser from "../../domain/entities/user";
import ServiceProvider from "../../domain/entities/serviceProvider";
import Category from "../../domain/entities/category";
import { IBlog } from "../../domain/entities/blog";
import { IWebinar } from "../../domain/entities/webinars";
import { IComplaint } from "../../domain/entities/complaint";
import ScheduledBooking from "../../domain/entities/scheduledBookings";

interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findAllUsers(
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }>;
  blockUser(id: string): Promise<boolean>;

  findAllServiceProviders(
    page: number,
    limit: number
  ): Promise<{ serviceProviders: ServiceProvider[]; total: number }>;

  getServiceProviderDetails(id: string): Promise<ServiceProvider | null>;
  approveServiceProvider(id: string): Promise<boolean>;
  blockProvider(id: string): Promise<boolean>;

  addCategory(categoryName: string, subCategories: string[]): Promise<boolean>;
  findAllCategories(
    page: number,
    limit: number
  ): Promise<{ categorys: Category[]; total: number }>;
  unlistCategory(id: string): Promise<Category | null>;

  addBlog(blogData: Partial<IBlog>): Promise<IBlog>;
  listBlogs(
    page: number,
    limit: number
  ): Promise<{ blogs: IBlog[]; total: number }>;
  unlistBlog(blogId: string): Promise<IBlog | null>;
  updateBlogStatus(blogId: string, isListed: boolean): Promise<IBlog>;

  addWebinar(webinar: IWebinar): Promise<IWebinar>;
  listWebinars(): Promise<IWebinar[]>;
  unlistWebinar(webinarId: string): Promise<IWebinar | null>;

  toggleWebinarListing(webinarId: string): Promise<IWebinar | null>;
  getAllComplaints(): Promise<any[]>;
  respondToComplaint(id: string, responseMessage: string): Promise<boolean>;
  getAllBookings(page: number, limit: number): Promise<ScheduledBooking[]>;
  dashboardDetails() : Promise<any>


}

export default IAdminRepository;
