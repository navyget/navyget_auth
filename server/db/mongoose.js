import mongoose from 'mongoose';

// setup mongoose to use promises

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/navyget_auth_db');

module.exports = { mongoose };
