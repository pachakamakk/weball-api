var express = require('express');
var router = express.Router();
var Discussion = require('../models/discussion');
var Auth = require('../middlewares/Auth');
var User = require('../models/user');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;


// Send message to a user (by id of user)
router.patch('/user/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  Discussion.findOne({
    usersId: {
      $all: [req.user._id, ObjectId(req.params._id)]
    }
  }, function(err, discussion) {
    if (err)
      return next(err);
    else if (discussion) { // Add Message 
      discussion.messages.push({
        content: req.body.content,
        createdAt: new Date(),
        createdBy: req.user._id
      });
      discussion.save(function(err, discussion) {
        if (err)
          return next(err);
        else
          res.json(discussion)
      });
    } else { // Create Discussion + Store Message
      var discussion = new Discussion({
        usersId: req.user._id,
        messages: {
          content: req.body.content,
          createdAt: new Date(),
          createdBy: req.user._id
        }
      });
      discussion.usersId.push(req.params._id);
      discussion.save(function(err, discussion) {
        if (err) return next(err);
        else
          res.json(discussion)
      });
    }
  });
});

// List Discussions with infos users
router.get('/me', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  var discussionsWithUserInfo = [];
  Discussion.find({
      "usersId": req.user._id
    }, {
      messages: {
        $slice: -1 //get last message
      }
    }).skip(req.query.skip)
    .limit(req.query.limit)
    .exec(function(err, discussions) {
      if (err) {
        return next(err);
      } else if (discussions[0]) {
        discussions.forEach(function(discussion) {
          var index = discussion.usersId.indexOf(req.user._id)
          if (index > -1) // delete my userId to get only userTo
            discussion.usersId.splice(index, 1);
          discussionsWithUserInfo.push(function(callback) {
            User.findById(discussion.usersId).select({ //Get info of each user
                'username': 1,
                'firstName': 1,
                'lastName': 1,
                'photo': 1
              })
              .exec(function(err, user) {
                if (err) callback(err);
                else if (!user) // user not found or deleted..
                {
                  discussion.lastUser.photo = "";
                  discussion.lastUser.username = "Utilisateur Introuvable";
                  discussion.lastUser.firstname = "Utilisateur Introuvable";
                  callback(null, discussion);
                } else {
                  discussion.lastUser.photo = user.photo;
                  discussion.lastUser.username = user.username;
                  discussion.lastUser.firstname = user.firstname;
                  discussion.lastUser.lastname = user.lastname;
                  callback(null, discussion);
                }
              });
          });
        });
        async.parallel(discussionsWithUserInfo, function(err, result) {
          /* this code will run after all get informations each user */
          if (err)
            console.log(err);
          res.json(result);
        });
      } else
        return next({
          status: 404,
          message: 'Discussion Not Found'
        }, null);
    });
});

// Get messages of a discussion by Id
router.get('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  Discussion.findById(req.params._id).exec(function(err, discussion) {
    if (err) {
      return next(err);
    } else if (discussion) {
      res.json(discussion);
    } else
      return next({
        status: 404,
        message: 'Discussion Not Found'
      }, null);
  });
});

// Create a Discussion with n users
router.post('/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  var str = req.body.usersId;
  var usersId = str.split(",").map(function(val) {
    return ObjectId(val);
  });

  var discussion = new Discussion({
    usersId: usersId
  });
  discussion.usersId.push(req.user._id);
  discussion.save(function(err, discussion) {
    if (err)
      next(err);
    else {
      res.json(discussion);
    }
  });
});

module.exports = router;
