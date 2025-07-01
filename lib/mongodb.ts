// lib/mongodb.ts
import mongoose from 'mongoose';

// 💥 Auto-register every schema exactly once
import '@/models/Store';
import '@/models/Billboard';
import '@/models/Category';
import '@/models/Product';
import '@/models/Size';
import '@/models/Color';
import '@/models/Order';
import '@/models/OrderItem';

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'ecommerce-admin',
    });
    isConnected = true;
    console.log('MongoDB Connected');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;
