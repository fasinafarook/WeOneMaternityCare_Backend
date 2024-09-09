// interface ScheduledBooking {
//     _id: string;
//     date: Date;
//     fromTime: Date;
//     toTime: Date;
//     description: string;
//     title: string;
//     price: number;
//     serviceProviderId: string;
//     userId: string
//     status: string;
//     roomId: string;
//     providerRatingAdded: boolean
//     reminderSent: boolean
// }

// interface user {
//     name: string;
//     email: string
// }
// export interface AggregatedScheduledBooking extends ScheduledBooking {
//     user: user
// }

// export default ScheduledBooking

interface ScheduledBooking {
  _id: string;
  date: Date;
  fromTime: Date;
  toTime: Date;
  description: string;
  title: string;
  price: number;
  serviceProviderId: string;
  userId: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Refunded";
  roomId: string;
  providerRatingAdded: boolean;
  reminderSent: boolean;
  cancellationReason?: string; // Made optional since it may not be applicable initially
  cancellationDate?: Date; // Made optional since it may not be applicable initially
  paymentIntentId: string;
}

interface User {
  name: string;
  email: string;
}

export interface AggregatedScheduledBooking extends ScheduledBooking {
  user: User;
}

export default ScheduledBooking;
