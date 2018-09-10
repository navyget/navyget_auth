import mongoose from 'mongoose';

// setup mongoose to use promises

mongoose.Promise = global.promise;
mongoose.connect('mongodb://localhost:27017/navyget_auth_db');

module.exports = { mongoose };
