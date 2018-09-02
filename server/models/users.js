import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    trim: true,
  },
  emailAddress: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email address',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  accountType: {
    type: String,
    required: true,
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  }],
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
});

// restrict user json data returned
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['firstName', 'lastName', 'username', 'emailAddress', 'accountType']);
};
