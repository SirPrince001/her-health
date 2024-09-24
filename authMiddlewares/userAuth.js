require('dotenv').config();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { ValidationError, NotFoundError } = require('../helper/error');

const userAuth = async (request, response, next) => {
  try {
    // accept user token
    let userToken = request.headers.authorization;
    if (!userToken) {
      throw new ValidationError('User token is required');
    }

    // remove Bearer prefix from token
    userToken = userToken.split(' ')[1];

    // verify token
    let decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);

    // check if token is expired
    if (decodedToken.exp * 1000 < Date.now()) {
      throw new ValidationError('User token has expired');
    }

    // find user in database
    let user = await User.findById(decodedToken.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // store student details in request object
    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = userAuth;
