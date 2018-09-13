import express from 'express';
import axios from 'axios';
import Users from '../models/users';
import authenticate from '../middleware/authenticate';

const _ = require('lodash');

const router = express.Router();

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

// normal user registration
router.post('/user/register', (req, res) => {
  const body = _.pick(req.body, ['first_name', 'last_name', 'username', 'email_address', 'password', 'account_type']);
  if (body.account_type !== 'normal user') {
    res.status(403).send({
      message: 'Please Select normal user as account type',
    });
  }
  const user = new Users(body);
  user.save().then(() => user.generateAuthToken()).then((token) => {
    res.header('x-auth', token).send({
      user,
      message: 'Congratulations. You have Successfully opened a user account',
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// create a business account and store
router.post('/business/register', (req, res) => {
  const userBody = _.pick(req.body, ['first_name', 'last_name', 'username', 'email_address', 'password', 'account_type']);
  const storeBody = _.pick(req.body, ['store_name', 'store_type', 'store_category', 'location']);

  if (userBody.account_type !== 'business account') {
    res.status(403).send({
      message: 'Please Select business account as account type',
    });
  }
  const user = new Users(userBody);
  user.save().then(() => user.generateAuthToken()).then((token) => {
    Users.findByToken(token).then((person) => {
      if (!person) {
        return Promise.reject();
      }
      const store = Object.assign({}, storeBody, { _storeAdmin: user._id });
      return axios.post('http://localhost:3000/store', store).then((response) => {
        res.header('x-auth', token).send({
          user,
          response,
          message: 'Congratulations. You have successfully registered your business account',
        });
      });
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// login a user {using email and password}
router.post('/login', (req, res) => {
  const body = _.pick(req.body, ['email_address', 'password']);

  Users.findByCredentials(body.email_address, body.password)
    .then(user => user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send({
        user,
        message: 'Congratulations. You have successfully logged into your account',
      });
    })).catch((e) => {
      res.status(400).send(e);
    });
});

// logout a user
router.delete('/logout/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.send({
      message: 'you have been successfully logged out',
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

export default router;
