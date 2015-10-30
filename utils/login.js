/*
 ** Header
 ** 
 ** Created By: Elias CHETOUANI
 ** Created At: 28/07
 ** Functions for Login, Generate Jwt 
 */

var User = require('../models/user');
var Token = require('../models/token');
var secretKey = require('../config/secret')();
var jwt = require('jsonwebtoken');


var login = function(req, res, next) {

  if (!req.body.login) {
    return next({
      status: 400,
      message: 'Login is empty'
    });
  }

  User.findOne({
    $or: [{
      username: req.body.login
    }, {
      email: req.body.login
    }]
  }, function(err, user) {

    // Error
    if (err)
      return next(err);

    // No user found
    else if (!user) {
      return next({
        status: 401,
        message: 'No such user'
      });
    }

    // User Found: verify password and generate token
    else {
      user.verifyPassword(req.body.password, function(err, isMatch) {
        if (err) {
          return next(err);
        }
        // Password did not match
        else if (!isMatch) {
          return next({
            status: 401,
            message: 'Invalid password'
          });
        }

        // Success
        else {
          var expiration = expiresIn(1);
          var token = jwt.sign({
            expire: expiration,
            uid: user._id
          }, secretKey);
          var update = {
            user: user._id,
            value: token,
            updated: new Date(),
            expire: expiration
          };
          var options = {
            upsert: true,
            runValidators: true
          };
          Token.update({
            user: user._id
          }, update, options, function(err, saved) {
            if (err) return next(err);
            else if (saved) {
              req.token = {
                'token': token
              };
              next();
            } else
              return next({
                status: 405,
                message: 'Error Token Update'
              }, null);
          });
        }
      });
    }
  });
}


function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

exports.login = login;