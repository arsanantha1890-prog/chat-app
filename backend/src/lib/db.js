
import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGODB CONNECTED:", conn.connection.host);
  } catch (error) {
    console.error("Error connection to MONGODB:",error);
    process.exit(1); //1 status code means fail, 0 means success
  }
};

/*
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Trying to connect...");

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected!");
    console.log(conn.connection.host);
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error.name);
    console.error(error.message);
    console.error(error);
  }
};
*/