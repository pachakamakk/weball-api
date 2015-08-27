/*
 ** Header
 **
 ** Created By
 ** Created At
 */

// Dependances
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../middlewares/auth');


// List users
router.get('/', function(req, res, next) {
  User.find({})
    .select({
      'username': 1,
      'email': 1,
      'firstname': 1,
      'age': 1,
      'lastname': 1,
      'register_date': 1,
      'has_team': 1,
      'fav_fields': 1,
      'points': 1,
      'friends': 1
    })
    .exec(function(err, users) {
      if (err) next(err);
      else res.json(users);
    });
})


// Register user 
router.post(function(req, res, next) {
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    firstname: req.body.firstname,
    age: req.body.age,
    lastname: req.body.lastname
  });

  user.save(function(err, user) {
    if (err)
      next(err);
    else
      res.json(user);
  });
});


//Get user from his username
router.get('/:uname', function(req, res, next) {
  User.findOne({
      username: req.params.uname
    }).select({
      'username': 1,
      'email': 1,
      'firstname': 1,
      'age': 1,
      'lastname': 1,
      'has_team': 1,
      'fav_fields': 1,
      'points': 1,
      'friends': 1
    })
    .exec(function(err, user) {
      // Error
      if (err) next(err);
      // No user found
      else if (!user) next({
        status: 401,
        message: 'No such user'
      });
      // Success
      else
        res.json(user);
    });
});

module.exports = router;