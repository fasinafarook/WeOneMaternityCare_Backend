import User from "../../domain/entities/user";
import ServiceProvider from "../../domain/entities/serviceProvider";
import ScheduledBooking from "../../domain/entities/scheduledBookings";
import { IWebinar } from "../../domain/entities/webinars";
import { IBlog } from "../../domain/entities/blog";

export interface ProviderBasic{
  name: string;
  qualification?:string;
  service?: string;
  profilePicture?: string
}

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  saveUser(user: User): Promise<User | null >
  findUserById(id: string): Promise<User | null >
  updatePassword(userId: string, password: string): Promise<void | null> 
  editProfile(userId: string, name: string, mobile: number): Promise<void>
  getApprovedAndUnblockedProviders(): Promise<ServiceProvider[]>;
  getServiceProviderDetails(id: string): Promise<ServiceProvider | null>

    
  getProviderSlotDetails(serviceProviderId: string): Promise<any>

  // bookSlot(info: any): Promise<void | null>
  getScheduledBookings(userId: string, page: number, limit: number): Promise< {bookings: ScheduledBooking[] | null, total: number}>

  getListedWebinars(): Promise<IWebinar[]>;

  getListedBlogs(page: number, limit: number): Promise<{ blogs: IBlog[]; total: number }>;
  getWallet(userId: string): Promise<any>


}

export default IUserRepository  