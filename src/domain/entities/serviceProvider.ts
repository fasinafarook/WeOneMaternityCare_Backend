interface ServiceProvider {
    _id: string; 
    name: string;
    email: string;
    password: string;
    mobile: string;
    service?: string;
    specialization?: string;
    qualification: string;
    experienceCrt?: string; 
    profilePicture?: string;
    expYear?: number;
    rate?: number;
    location?: string;
    isApproved: boolean;
    isBlocked: boolean;
    createdAt: Date;
    hasCompletedDetails: boolean

  }
  
  export default ServiceProvider;
  