import ServiceProvider from "../../domain/entities/serviceProvider"
import Category from "../../domain/entities/category";
import ProviderSlot from "../../domain/entities/providerSlot";
import ScheduledBooking from "../../domain/entities/scheduledBookings";

interface IServiceProviderRepository {
    findByEmail(email: string): Promise<ServiceProvider | null>
    saveServiceProvider(serviceProvider: ServiceProvider): Promise<ServiceProvider | null>
    findServiceProviderById(id: string): Promise<ServiceProvider | null>
    saveServiceProviderDetails(ServiceProviderDetails: ServiceProvider): Promise<ServiceProvider | null>
    findById(id: string): Promise<ServiceProvider | null>
    getAllCategories(): Promise<string[]>;
    updatePassword(serviceProviderId: string, password: string): Promise<void | null>

    saveProviderSlot(slotData: ProviderSlot): Promise<ProviderSlot | null>
    getProviderSlots(serviceProviderId: string, page: number, limit: number, searchQuery: string): Promise<{slots: ProviderSlot[] | null, total: number}>
    getDomains():Promise<Category[] | null>
    getScheduledBookings(serviceProviderId: string, page: number, limit: number): Promise<{bookings: ScheduledBooking[], total: number} >
    getPaymentDashboard(serviceProviderId: string): Promise<any>
    getScheduledBookingByRoomId(roomId: string): Promise<ScheduledBooking | null>
    findProviderSlot(slotId: string): Promise<any>;
    saveProviderSlots(providerSlot: any): Promise<any>;
    updateStatus(bookingId: string, status: string): Promise<any>;
    editProfile(serviceProviderId: string, details: ServiceProvider): Promise<void>
    getDashboardStats(providerId: string): Promise<any>;
    findBookingById(bookingId: string): Promise<any>;
    cancelBooking(bookingId: string, cancelReason: string): Promise<any>;



}

export default IServiceProviderRepository