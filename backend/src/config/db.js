const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore error if custom DNS cannot be set
}

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('---------------------------------------------------------');
    console.error('❌ [DB] CRITICAL: Neither MONGODB_URI nor MONGO_URI is set in environment variables!');
    console.error('👉 Please add MONGO_URI to your Render Environment Variables.');
    console.error('---------------------------------------------------------');
  }

  const targetUri = mongoUri || 'mongodb://127.0.0.1:27017/safe-era';

  try {
    mongoose.set('bufferTimeoutMS', 25000);
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`[DB] ✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] ❌ MongoDB Connection Error: ${error.message}`);
    console.error(`👉 Tip: If using MongoDB Atlas, ensure '0.0.0.0/0' (Allow access from anywhere) is enabled in Atlas Network Access.`);
  }
};

module.exports = connectDB;
