import mongoose, { Schema, Model } from "mongoose";
import IUser from "../../domain/entities/user";

const userSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  mobile: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  isBlocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAdmin: { type: Boolean, required: true, default: false },
  userAddress: {
    type: String,
    required: false,
  },

  bp: {
    type: String,
    required: false,
  },

  sugar: {
    type: String,
    required: false,
  },

  weight: {
    type: Number,
    required: false,
  },

  additionalNotes: {
    type: String,
    required: false,
  },

  recordDate: {
    type: Date,
    required: false,
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const users: Model<IUser> = mongoose.model<IUser>("user", userSchema);

export default users;
