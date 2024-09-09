import mongoose, { Schema } from "mongoose";
import ScheduledBooking from "../../domain/entities/scheduledBookings";

const ScheduledBookingSchema = new Schema<ScheduledBooking>(
  {
    date: {
      type: Date,
      required: true,
    },
    fromTime: {
      type: Date,
      required: true,
    },
    toTime: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    serviceProviderId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Refunded"],
      default: "Scheduled",
    },
    roomId: {
      type: String,
      required: true,
    },
    providerRatingAdded: {
      type: Boolean,
      default: false,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    cancellationDate: {
      type: Date,
      default: null,
    },
    paymentIntentId: { type: String, required: true }, // Add this field
  },
  { timestamps: true }
);

const ScheduledBookingModel = mongoose.model<ScheduledBooking>(
  "SchduledBooking",
  ScheduledBookingSchema
);

export { ScheduledBookingModel };
