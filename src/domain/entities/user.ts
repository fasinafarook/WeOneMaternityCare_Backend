interface IUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  isBlocked: boolean;
  // isAdmin: boolean;
  profilePicture?:string;
  userAddress?: string;
  bp?: string;
  sugar?: string;
  weight?: number;
  additionalNotes?: string;
  recordDate?: Date;
  createdAt: Date;
  updatedAt: Date;

}

export default IUser;
