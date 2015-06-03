var User = require('../models/user');

module.exports = function(req, res, next)
{
  if (req.user.role == User.roles.ADMIN)
    next();
  else
    return next({status: 403, message:'Unauthorized'});
};
