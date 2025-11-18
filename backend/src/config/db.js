const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Allow overriding the database name via MONGO_DB_NAME; default to 'paw'
    const dbName = process.env.MONGO_DB_NAME || 'paw';
    await mongoose.connect(process.env.MONGO_URI, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected (db:', dbName + ')');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
