var roles = require('../utils/roles');
var Five = require('../models/five');

module.exports = function(req, res, next) {
  if (req.user.role == roles.FIVE) {
    Five.findById(req.user.five, function(err, res) {
      if (err) return next(err);
      else {
        req.five = res;
        next();
      }
    });
  } else if (req.user.role == roles.ADMIN)
    next();
  else
    return next({
      status: 403,
      message: 'Unauthorized'
    });
};