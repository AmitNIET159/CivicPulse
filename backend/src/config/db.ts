import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI_CIVICPULSE || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Missing MongoDB URI. Set MONGODB_URI_CIVICPULSE or MONGODB_URI.');
    }

    const conn = await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

export default connectDB;
