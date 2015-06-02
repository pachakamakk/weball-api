var jwt = require('jwt-simple');
var Token = require('../models/token');
var User = require('../models/user');

module.exports = function(req, res, next)
{
  var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token'];

  if (!token)
    return next({message:'Unauthorized', status:403});

  // Check expiration of the token
  var decoded = jwt.decode(token, require('../config/secret.js')());
  if (decoded.exp <= Date.now()) {return next({message:'Unauthorized', status:403});}

  Token.findOne({value: token}, function(err, token)
  {
    if (err) return next(err);

    // No user found with that token
    else if (!token) return next({status:403, message:'Bad Token'});

    // Token ok
    else {
      User.findById(token.userId, function(err, user){
        //Error
        if (err) return next(err);
        // Put the appropriate user in the req object and finish
        else {
        req.user = user;
        next()
        }
      })
    }
  });

};
