export interface IWebinar {
  webinarId: string;
  title: string;
  quotes: string;
  thumbnail: string; // Required thumbnail field
  videoUrl: string; // Required video URL field
  createdAt: Date;
  isListed: boolean; // To manage unlisted webinars
}
