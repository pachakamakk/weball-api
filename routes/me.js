var express = require('express');
var router = express.Router();
var User = require('../models/user');
var isAuth = require('../middlewares/validateToken');

/** /me POST : update current user
 **  param : username, email
 **  response : {'message': 'Modified', 'status': 200}
 **
 **/

router.route('/')

// GET current user
.get(isAuth, function(req, res){
  res.json(req.user);
})

// POST update current user
// TODO : See documentation of findByIdAndUpdate

.post(isAuth, function(req, res, next){
  User.findById({_id: req.user._id}, function(err, user){
    if (err) next(err);
    user.username = req.body.username;
    if (req.body.password !== undefined) user.password = req.body.password;
    user.email = req.body.email;    
    user.save(function(err){
      if (err) next(err);
      else res.sendStatus(200);
    });
  });
});

module.exports = router;
