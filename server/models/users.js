import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const _ = require('lodash');

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

const UserSchema = mongoose.Schema({
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
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
  last_login: {
    type: Date,
  },
});

// restrict user json data returned

/* eslint-disable-next-line */
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['firstName', 'lastName', 'username', 'emailAddress', 'accountType']);
};

// Generate authentication token
/* eslint-disable-next-line */
UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access },
    process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  const currentDate = new Date();
  user.lastLogin = currentDate;

  return user.save().then(() => token);
};

// Remove authentication token
/* eslint-disable-next-line */
UserSchema.methods.removeToken = function (token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: { token },
    },
  });
};

// find user using token
/* eslint-disable-next-line */
UserSchema.statics.findByToken = function (token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject(e);
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token,
  });
};


// find user using credentials
/* eslint-disable-next-line */
UserSchema.statics.findByCredentials = function (email,password) {
  const User = this;

  return User.findOne({ email }).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

// hash user password before save
/* eslint-disable-next-line */
UserSchema.pre('save', function (next) {
  const user = this;

  const currentDate = new Date();
  user.updated_at = currentDate;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const Users = mongoose.model('Users', UserSchema);

export default Users;
