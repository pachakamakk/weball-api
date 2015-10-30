/*
 ** Header
 ** 
 ** Created By: Elias CHETOUANI
 ** Created At: 26/08/15
 ** Functions for Authentification, getUserByJWT...
 */

//var jwt = require('jwt-simple');
var jwt = require('jsonwebtoken');
var Token = require('../models/token');
var secretKey = require('../config/secret.js')();


/* How to use it ? 
 **
 ** to protect a route: app.get('/:_id', Auth.validateAccesAPIAndGetUser, function(err, match){});
 ** to protect a group of end point: router.use(Auth.validateAccesAPIAndGetUser;
 **
 */

var validateAccessAPIbyToken = function(req, res, next) {
  var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token'];
  if (!token)
    return next({
      message: 'Unauthorized: Token Required',
      status: 401
    });

  // Check expiration of the token. In the token there are: value, exp, uid.
  //var decoded = jwt.decode(token, require('../config/secret.js')());
  Token.findOne({
    value: token
  }, function(err, token) {
    if (err) return next(err);
    else if (token) {
      jwt.verify(token.value, secretKey, function(err, decoded) {
        if (err) return next(err);
        else if (decoded.exp < Date.now())
          return next({
            message: 'Unauthorized: Token Expired',
            status: 401
          });
        else
          next();
      });
    } else
      return next({
        message: 'Deconnected',
        status: 404
      });
  });
};


var validateAccessAPIAndGetUser = function(req, res, next) {
  var token = (req.body && req.body.token) || req.query.token || req.headers['x-access-token'];
  if (!token)
    return next({
      message: 'Unauthorized: Token Required',
      status: 401
    });

  // validation of the token.
  Token.findOne({
    value: token
  }).populate({
    path: 'user',
    select: {
      password: 0
    }
  }).exec(function(err, token) {
    if (err) return next(err);
    else if (token) {
      jwt.verify(token.value, secretKey, function(err, decoded) {
        if (err) return next(err);
        else if (decoded.expire < Date.now())
          return next({
            message: 'Unauthorized: Token Expired',
            status: 401
          });
        else {
          console.log(decoded)
          req.user = token.user;
          next();
        }
      });
    } else
      return next({
        message: 'Deconnected',
        status: 404
      });
  });
};

exports.validateAccessAPIbyToken = validateAccessAPIbyToken;
exports.validateAccessAPIAndGetUser = validateAccessAPIAndGetUser;