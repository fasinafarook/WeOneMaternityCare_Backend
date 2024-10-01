import mongoose, { Schema, Document } from "mongoose";
import { IWebinar } from "../../domain/entities/webinars";

interface IWebinarDocument extends IWebinar, Document {}

const WebinarSchema: Schema = new Schema({
  webinarId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  quotes: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model<IWebinarDocument>("Webinar", WebinarSchema);
