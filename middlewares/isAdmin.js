var roles = require('../utils/roles');

module.exports = function(req, res, next)
{
  if (req.user.role == roles.ADMIN)
    next();
  else
    return next({status: 403, message:'Unauthorized'});
};
