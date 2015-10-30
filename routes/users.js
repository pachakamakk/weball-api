/*
 ** Header
 **
 ** Created By Elias CHETOUANI
 ** Created At 01/09/2015
 ** Functions for Users 
 */

// Dependances
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Auth = require('../middlewares/Auth');
var async = require('async');
var FriendRequest = require('../models/friendsrequest');
var Friend = require('../models/friend');

// List users
router.get('/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
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
    lastName: req.body.lastName,
    fullName: req.body.firstName + ' ' + req.body.lastName,
    age: req.body.age,
    birthday: req.body.birthday,
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
  user.fullName = req.body.firstName + ' ' + req.body.lastName;
  user.birthday = req.body.birthday || user.birthday;
  user.location = req.body.location || user.location;
  user.photo = req.body.photo || user.photo;
  user.save(function(err, user) {
    if (err) return next(err.errors[Object.keys(err.errors)[0]]);
    else
      res.json(user);
  });
})

// Search User by string (for searchBar)
.get('/now/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  //Create regular expression of req.params.search -> (text in search bar)

  //var fullStr = req.query.search.split(/ /).join("|");
  var regFullStr = new RegExp(req.query.search);

  // In order to search username
  // var firstStr = req.query.search.substr(0, req.query.search.indexOf(' '));
  // var regFirstStr = new RegExp(firstStr, 'im');

  User.find({
      $or: [{
        username: {
          $regex: regFullStr,
          $options: 'i'
        }
      }, {
        fullName: {
          $regex: regFullStr,
          $options: 'i'
        }
      }]
    }).select({
      'username': 1,
      'fullName': 1,
      'location': 1
    }).skip(req.query.skip)
    .limit(req.query.limit)
    .exec(function(err, user) {
      if (err) next(err);
      // No user found
      else {
        res.json(user);
      }
    });
})

.get('/me/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  console.log(req.user)
  User.findById(req.user._id).select({
    'password': 0
  }).exec(function(err, user) {
    if (err) next(err);
    // No user found
    else if (!user) next({
      status: 404,
      message: 'User Not Found'
    });
    else {
      res.json(user);
    }
  });
})

//Get user from his id (to access a his profil)
.get('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  var relationShipStatus = "";
  async.parallel([
      function requestExist(callback) {
        FriendRequest.findOne({
          $or: [{
            to: req.params._id,
            from: req.user._id
          }, {
            to: req.user._id,
            from: req.params._id
          }]
        }, function(err, request) {
          if (err) return callback(err);
          else if (request) {
            if (request.from.equals(req.user._id))
              relationShipStatus = "pending"; // En attente
            else
              relationShipStatus = "comfirm"; // Souhaite vous ajouter
            callback();
          } else
            callback();
        });
      },

      function userIsMyFriend(callback) {
        Friend.findOne({
          user: req.user._id,
          'list.user': req.params._id
        }, function(err, friendList) {
          if (err) return callback(err);
          else if (friendList) {
            relationShipStatus = "friend";
            callback();
          } else
            callback();
        });
      }
    ],

    function getUser(err, result) {
      if (err) return next(err);
      User.findById(req.params._id).select({
          'username': 1,
          'email': 1,
          'firstName': 1,
          'birthday': 1,
          'lastName': 1,
          'points': 1,
          'matchs': 1,
          'roles': 1
        })
        .lean().exec(function(err, user) {
          if (err) next(err);
          // No user found
          else if (!user) next({
            status: 404,
            message: 'User Not Found'
          });
          else {
            if (relationShipStatus.length == 0)
              user.relationShipStatus = "user";
            else
              user.relationShipStatus = relationShipStatus;
            console.log(user)
            res.json(user);
          }
        });
    });
});



module.exports = router;
