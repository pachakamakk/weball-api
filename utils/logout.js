/*
 ** Header
 ** 
 ** Created By: Elias CHETOUANI
 ** Created At: 28/07
 ** Functions for Logout
 */

var Token = require('../models/token');

var logout = function(req, res, next) {
  console.log(req.token);
  Token.remove({
    value: req.token
  }, function(err) {
    if (err) return next(err);
    next();
  });
}

exports.logout = logout;