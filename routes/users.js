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
var Auth = require('../middlewares/Auth');


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
router.post('/', function(req, res, next) {
  console.log(new Date(req.body.birthday));

  var user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    firstName: req.body.firstName,
    age: req.body.age,
    birthday: req.body.birthday,
    lastName: req.body.lastName,
    date: new Date
  });
  user.save(function(err, user) {
    if (err) {
      return next(err);
    } else
      res.json(user);
  });
})


// Update my informations
.patch('/me', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  var query = {
    _id: req.user._id
  };
  //req.body.roles = "user";
  User.findOneAndUpdate(query, req.body, {
    'new': true
  }).exec(function(err, updated) {
    if (err)
      next(err);
    else
      res.json(updated);
  });
})


//Get user from his username
.get('/:uname', function(req, res, next) {
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
        status: 404,
        message: 'No such user'
      });
      // Success
      else
        res.json(user);
    });
});

module.exports = router;
