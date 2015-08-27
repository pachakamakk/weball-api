/*
 ** Header
 ** 
 ** Created By: 
 ** Created At: 
 ** Functions for Login, Generate Jwt 
 */


var User = require('../models/user');
var Token = require('../models/token');
var jwt = require('jwt-simple');


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
    //Error
    if (err)
      return next(err);

    //No user found
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
          var data = genToken(user);
          Token.findOne({
            user: user._id
          }, function(err, token) {
            if (err) return next(err);
            // Not token find make a new TokenSchema
            else if (!token) {
              var token = new Token({
                value: data.token,
                expire: data.expire,
                user: user._id
              });
              token.save(function(err) {
                if (err) return next(err);
                else {
                  req.token = {
                    'token': token.value
                  };
                  next();
                }
              });
            }
            // if user already exist -> update 
            else {
              token.value = data.token;
              token.expire = data.expire;
              token.save(function(err) {
                if (err) {
                  console.log(err);
                  return next(err);
                } else {
                  req.token = {
                    'token': token.value
                  };
                  next();
                }
              });
            }
          });
        }
      });
    }
  });
}

var genToken = function(usr) {
  var expires = expiresIn(7);
  var token = jwt.encode({
    expire: expires,
    uid: usr._id
  }, require('../config/secret')());
  return {
    'token': token,
    'expire': expires
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

exports.login = login;