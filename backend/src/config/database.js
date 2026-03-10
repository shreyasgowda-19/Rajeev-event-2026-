const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options - not needed in Mongoose 6+
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    
    // Don't crash server on DB error - let it retry
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tip: Check your internet connection and MongoDB Atlas whitelist');
    }
    if (error.message.includes('authentication failed')) {
      console.log('💡 Tip: Check your MongoDB username and password');
    }
    
    // Retry connection after 5 seconds
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;