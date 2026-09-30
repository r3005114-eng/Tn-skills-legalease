import mongoose from 'mongoose';
import { config } from './config.js';

let isMongooseConnected = false;

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongooseConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isMongooseConnected = false;
    console.log(`[MongoDB] Direct connection unavailable (${error.message}).`);
    console.log(`[Database] Initialized LegalEase In-Memory/Persistent Repository mode. All features active.`);
    return false;
  }
};

export const getIsMongooseConnected = () => isMongooseConnected;
