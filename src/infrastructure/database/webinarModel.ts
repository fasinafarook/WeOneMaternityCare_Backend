// import mongoose, { Schema, Document, Model } from 'mongoose';
// import { Webinar } from '../../domain/entities/webinars';

// export interface WebinarDocument extends Webinar, Document {}

// const WebinarSchema: Schema<WebinarDocument> = new Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   videoUrl: { type: String, required: true },
//   thumbnail: { type: String, required: true },
//   uploadDate: { type: Date, default: Date.now },
//   isListed: { type: Boolean, default: true }, // To unlist a webinar
// });

// const WebinarModel: Model<WebinarDocument> = mongoose.model<WebinarDocument>('Webinar', WebinarSchema);

// export default WebinarModel;

import mongoose, { Schema, Document } from "mongoose";
import { IWebinar } from "../../domain/entities/webinars";

interface IWebinarDocument extends IWebinar, Document {}

const WebinarSchema: Schema = new Schema({
  webinarId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  quotes: { type: String, required: true },
  thumbnail: { type: String, required: true },
  videoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isListed: { type: Boolean, default: true },
});

export default mongoose.model<IWebinarDocument>("Webinar", WebinarSchema);
