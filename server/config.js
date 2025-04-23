require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/youtube_clone',
};
