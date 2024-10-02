import mongoose, { Schema, Document, Model } from "mongoose";
import ServiceProvider from "../../domain/entities/serviceProvider";

const serviceProviderSchema: Schema<ServiceProvider> = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  mobile: {
    type: String,
    required: true,
  },

  service: {
    type: String,
  },

  specialization: {
    type: String,
  },

  qualification: {
    type: String,
  },

  profilePicture: {
    type: String,
  },

  experienceCrt: {
    type: String,
  },

  expYear: {
    type: Number,
  },

  rate: {
    type: Number,
  },

  location: {
    type: String,
  },

  isApproved: {
    type: Boolean,
    default: false,
  },

  isBlocked: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  hasCompletedDetails: {
    type: Boolean,
    default: false,
  },
});

const serviceProviderModel: Model<ServiceProvider> =
  mongoose.model<ServiceProvider>("serviceProvider", serviceProviderSchema);

export { serviceProviderModel };
