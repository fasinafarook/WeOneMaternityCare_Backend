import IPaymentRepository from "../../interfaces/repositories/IPaymentRepoitory";
import users from "../database/userModel";
import { ProviderSlotModel } from "../database/providerSlotModel";
import { ScheduledBookingModel } from "../database/scheduledBookingsModel";
import AppError from "../utils/appError";
interface ProcessRefundResult {
  success: boolean;
  booking?: any;
}

class PaymentRepository implements IPaymentRepository {
  async bookSlot(info: any): Promise<void | null> {
    console.log("bookslotinfo", info);

    const {
      serviceProviderId,
      to,
      from,
      _id,
      date,
      userId,
      price,
      title,
      description,
      roomId,
      paymentIntentId,
    } = info;

    try {
      const updatedSlot = await ProviderSlotModel.findOneAndUpdate(
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
          new: true,
        }
      );

      if (!updatedSlot) {
        console.error("Slot not found or update failed");
        return null;
      }

      const scheduledBooking = new ScheduledBookingModel({
        serviceProviderId,
        userId,
        date,
        fromTime: from,
        toTime: to,
        price,
        title,
        description,
        roomId,
        paymentIntentId,
      });

      const savedScheduledBooking = await scheduledBooking.save();
      console.log("db:", savedScheduledBooking);

      return;
    } catch (error) {
      console.error("Error updating slot: ", error);
      throw new Error("Failed to book slot");
    }
  }

  async cancelBooking(
    id: string,
    cancellationReason: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const booking = await ScheduledBookingModel.findById(id);

      if (!booking) {
        return { success: false, message: "Booking not found." };
      }

      if (booking.status !== "Scheduled") {
        return {
          success: false,
          message: "Only scheduled bookings can be canceled.",
        };
      }

      booking.status = "Cancelled";
      booking.cancellationReason = cancellationReason;
      booking.cancellationDate = new Date();

      await booking.save();

      return { success: true, message: "Booking cancelled successfully." };
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return {
        success: false,
        message: "An error occurred while cancelling the booking.",
      };
    }
  }

  async processRefund(id: string): Promise<ProcessRefundResult> {
    try {
      const booking = await ScheduledBookingModel.findByIdAndUpdate(
        id,
        { status: "Refunded" },
        { new: true }
      ).exec();

      if (!booking) {
        return { success: false };
      }

      return { success: true, booking };
    } catch (error) {
      console.error("Error processing refund:", error);
      return { success: false };
    }
  }
}

export default PaymentRepository;
