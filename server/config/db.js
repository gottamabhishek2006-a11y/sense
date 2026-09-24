const mongoose = require('mongoose');

const connectDB = async (retryCount = 0) => {
  const maxRetries = 3;
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`[Database] Target Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    if (retryCount < maxRetries) {
      console.log(`[Database] Retrying connection attempt ${retryCount + 1}/${maxRetries} in 3 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return connectDB(retryCount + 1);
    }
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] Mongoose disconnected from MongoDB cluster');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] Mongoose reconnected to MongoDB cluster');
});

module.exports = connectDB;
