import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI as string;
    await mongoose.connect(mongoURI);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

export default connectDB;



