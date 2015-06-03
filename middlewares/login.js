var User = require('../models/user');
var jwt = require('jwt-simple');
var Token = require('../models/token');

var login = function (req, res, next)
{
	User.findOne({$or:[{username: req.body.login}, {email: req.body.login}]}, function(err, user)
	{
    //Error
    if (err) return next(err);

    //No user found
    else if (!user) return next({status:406, message:'Nom d\'utilisateur inconnu'});

	//User Found, verify password and generate token
	else {
	   	  user.verifyPassword(req.body.password, function(err, isMatch)
	   	  {
	      if (err) { return next(err); }

	      // Password did not match
	      else if (!isMatch) { return next({status:405, message:'Mot de passe invalide'}); }
				// Success
				else
				{
					data = genToken(user);
					Token.findOne({userId: user._id}, function(err, token)
					{
			  	 		if (err) return next(err);
						// If not user found make a new TokenSchema
						else if (!token)
						{
							var token = new Token({
								value: data.token,
								expires: data.expires,
								userId: user._id
							});
							token.save(function(err) {if (err) return next(err);});
						}

						// if user already exist -> update
						else
						{
							token.value = data.token;
							token.expires = data.expires;
							token.save(function(err) {if (err) return next(err);});
						}
						req.token = {'token': token.value};
						next();
					});
				}
			});
		}
	});
}

// private methode

function genToken(user) {
  var expires = expiresIn(7); // 7 days
  var token = jwt.encode({
              exp: expires
              }, require('../config/secret')());
 return {
    token: token,
    expires: expires,
    user: user
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

exports.login = login;
