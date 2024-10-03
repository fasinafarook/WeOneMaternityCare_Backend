import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI ='mongodb+srv://fasinafarook786:H2h4PNkFxpMZ2qtM@weonematernitycare.euv5s.mongodb.net/weonematernitycare';
    await mongoose.connect(mongoURI);
    console.log("Database connected successfully",mongoURI);
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default connectDB;
