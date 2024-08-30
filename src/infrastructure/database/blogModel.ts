
import mongoose, { Schema, Document } from 'mongoose';
import { IBlog } from '../../domain/entities/blog';

interface BlogDocument extends IBlog, Document {}

const blogSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  image: { type: String },
  createdAt: { 
    type: Date, 
    required: true, 
    default: Date.now 
},
  isListed: { type: Boolean, default: true }, // true means listed, false means unlisted
});

export const BlogModel = mongoose.model<BlogDocument>('Blog', blogSchema);



// import mongoose, { Schema, Document } from 'mongoose';
// import { IWebinar } from '../../domain/entities/blog';

// interface WebinarDocument extends IWebinar, Document {}

// const webinarSchema: Schema<WebinarDocument> = new Schema({
//   title: { type: String, required: true },
//   quotes: { type: String },
//   thumbnail: { type: String, required: true }, // Thumbnail is now required
//   videoUrl: { type: String, required: true }, // Video URL is now required
//   createdAt: { 
//     type: Date, 
//     required: true, 
//     default: Date.now 
//   },
//   isListed: { type: Boolean, default: true }, // true means listed, false means unlisted
// });

// export const WebinarModel = mongoose.model<WebinarDocument>('Webinar', webinarSchema);
