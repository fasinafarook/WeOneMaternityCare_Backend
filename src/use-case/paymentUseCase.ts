import AppError from "../infrastructure/utils/appError";
import IPaymentRepository from "../interfaces/repositories/IPaymentRepoitory";
import IStripePayment from "../interfaces/utils/IStripPayment";
import IWalletRepository from "../interfaces/repositories/IWalletRepository";
// import Payment from "../infrastructure/database/paymentModel";  // Adjust the path as needed
import { ScheduledBookingModel } from "../infrastructure/database/scheduledBookingsModel";
import { ProviderSlotModel } from "../infrastructure/database/providerSlotModel";

class PaymentUseCase {
  constructor(
    private stripePayment: IStripePayment,
    private paymentRepository: IPaymentRepository,
    private walletRepository: IWalletRepository
  ) {}

  async makePayment(info: any, previousUrl: string) {
    console.log("prev url: ", previousUrl);
    console.log("Inside make payment: ", info);
    console.log("User ID in makePayment:", info.userId);

    const response = await this.stripePayment.makePayment(info, previousUrl);
    if (!response) {
      throw new AppError("Payment failed", 500);
    }
    return response;
  }

  async handleSuccessfulPayment(session: any) {
    console.log("session,", session);
    console.log("sessionssssss:", session.metadata);

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
    } = session.metadata;
    const paymentIntentId = session.payment_intent;

    console.log("hi", paymentIntentId);

    const book = await this.paymentRepository.bookSlot({
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
      paymentIntentId, // Pass paymentIntentId
    });
    const type = "credit";
    const wallet = await this.walletRepository.updateWallet(
      serviceProviderId,
      price,
      type
    );
    console.log("WALLET: ", wallet);
  }

  async cancelBooking(
    id: string,
    cancellationReason: string
  ): Promise<{ success: boolean; message?: string }> {
    // Validate inputs
    if (!id) {
      return { success: false, message: "Booking ID is required." };
    }
    if (!cancellationReason) {
      return { success: false, message: "Cancellation reason is required." };
    }

    // Delegate the cancellation logic to the repository
    return this.paymentRepository.cancelBooking(id, cancellationReason);
  }

  async processRefund(
    id: string,
    price: number
  ): Promise<{ success: boolean }> {
    const booking = await ScheduledBookingModel.findById(id);
    if (!booking) {
      throw new AppError("Booking not found.", 404);
    }

    const { paymentIntentId, serviceProviderId, date, fromTime, toTime } =
      booking;
    if (!paymentIntentId) {
      throw new AppError("Payment Intent ID not found for this booking.", 400);
    }

    console.log(
      `Processing refund for payment ID: ${paymentIntentId}, Amount: ${price}`
    );

    const refund = await this.stripePayment.processRefund(
      paymentIntentId,
      price
    );
    if (!refund) {
      throw new AppError("Refund failed.", 500);
    }

    const updateResult = await this.paymentRepository.processRefund(id);
    if (!updateResult.success) {
      throw new AppError("Failed to update booking status.", 500);
    }

    await this.walletRepository.updateWallet(booking.userId, price, "credit");
    await this.walletRepository.updateWallet(
      booking.serviceProviderId,
      price,
      "debit"
    );

    await ProviderSlotModel.updateOne(
      {
        serviceProviderId,
        "slots.date": date,
        "slots.schedule.from": fromTime,
      },
      { $set: { "slots.$.schedule.$[sch].status": "open" } },
      { arrayFilters: [{ "sch.from": fromTime, "sch.to": toTime }] }
    );

    return { success: true };
  }
}

export default PaymentUseCase;



