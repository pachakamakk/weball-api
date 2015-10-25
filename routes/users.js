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
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    matchs: [],
    firstName: req.body.firstName,
    age: req.body.age,
    birthday: req.body.birthday,
    lastName: req.body.lastName,
    date: new Date()
  });
  user.save(function(err, user) {
    if (err) {
      console.log(err.errors[Object.keys(err.errors)[0]]);
      return next(err.errors[Object.keys(err.errors)[0]]);
    } else
      res.json(user);
  });
})

// Update my informations
.patch('/me', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  var user = req.user;

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;
  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.birthday = req.body.birthday || user.birthday;
  user.location = req.body.location || user.location;
  user.photo = req.body.photo || user.photo;
  user.save(function(err, user) {
    if (err) return next(err.errors[Object.keys(err.errors)[0]]);
    else
      res.json(user);
  });
})


//Get user from his username
.get('/:uname', function(req, res, next) {
  User.findOne({
      username: req.params.uname
    }).select({
      'username': 1,
      'email': 1,
      'firstName': 1,
      'birthday': 1,
      'lastName': 1,
      'fav_fields': 1,
      'points': 1,
      'matchs': 1,
      'roles': 1
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
