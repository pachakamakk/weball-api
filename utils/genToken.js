var jwt = require('jwt-simple');

var genToken = function(usr) {
  var expires = expiresIn(7);
  var token = jwt.encode({
    exp: expires,
    userId : usr._id
  }, require('../config/secret')());
  return {
    token: token,
    expires: expires
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = genToken;