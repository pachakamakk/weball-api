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
router.post('/', function(req, res, next) {
  console.log(new Date(req.body.birthday));

  var user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    firstname: req.body.firstname,
    age: req.body.age,
    birthday: req.body.birthday,
    lastname: req.body.lastname
  });
  user.save(function(err, user) {
    if (err) {
      return next(err);
    }
    else
      res.json(user);
  });
})


// Update Partial Ressource of user
.patch('/:_id', function(req, res, next) {
  var query = {
    _id: req.params._id
  };

  User.findOneAndUpdate(query, req.body, {
    'new': true // get user after has been updated
  }).select({
    'password': 0,
    '_id': 0
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