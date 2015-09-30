/*
 ** Header
 ** 
 ** Created By: Elias CHETOUANI
 ** Created At: 26/08/15
 ** Functions for Authentification, getUserByJWT...
 */

var jwt = require('jwt-simple');
var Token = require('../models/token');
var User = require('../models/user');


/* How to use? 
**
** example for 1 route: app.get('/:_id', Auth.validateAccesAPIAndGetUser, function(err, match){});
** example for group of end point: router.use(Auth.validateAccesAPIAndGetUser;
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
  var decoded = jwt.decode(token, require('../config/secret.js')());
  if (decoded.exp < Date.now()) {
    return next({
      message: 'Unauthorized: Token Expired',
      status: 401
    });
  }
  next();
};


var validateAccessAPIAndGetUser = function(req, res, next) {
  var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token'];
  if (!token)
    return next({
      message: 'Unauthorized: Token Required',
      status: 401
    });

  var decoded = jwt.decode(token, require('../config/secret.js')());
  if (decoded.exp < Date.now()) {
    return next({
      message: 'Unauthorized: Token Expired',
      status: 401
    });
  }

  // Get User directy with the decoded token.
  User.findOne({
      _id: decoded.uid
    }).select({
      'username': 1,
      'email': 1,
      'firstname': 1,
      'age': 1,
      'lastname': 1,
      'fav_fields': 1,
      'points': 1,
      'friends': 1
    })
    .exec(function(err, user) {
      // Error
      if (err) next(err);
      // User not found
      else if (!user) next({
        message: 'No such user',
        status: 404
      });
      // Success
      else {
        req.user = user;
        next();
      }
    });
};

exports.validateAccessAPIbyToken = validateAccessAPIbyToken;
exports.validateAccessAPIAndGetUser = validateAccessAPIAndGetUser;