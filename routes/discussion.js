  /*
   ** Header
   **
   ** Created By Elias CHETOUANI
   ** Created At 15/09/15
   ** Functions For Private Discussions
   */

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
      users: [req.user._id, ObjectId(req.params._id)]
    }).select('messages').exec(function(err, discussion) {
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
          users: req.user._id,
          messages: {
            content: req.body.content,
            createdAt: new Date(),
            createdBy: req.user._id
          }
        });
        discussion.users.push(req.params._id);
        discussion.save(function(err, discussion) {
          if (err) return next(err);
          else
            res.json(discussion);
        });
      }
    });
  });

  // List Discussions with infos users
  router.get('/me', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    Discussion.find({
        "users": req.user._id
      }, {
        messages: {
          $slice: -1 // only last message
        }
      }).populate('messages.createdBy', 'username firstName lastName photo')
      .populate('users', 'username firstName lastName photo')
      .skip(req.query.skip)
      .limit(req.query.limit)
      .exec(function(err, discussions) {
        if (err) {
          return next(err);
        } else if (discussions[0]) {
          res.json(discussions);
        } else
          return next({
            status: 404,
            message: 'Discussions Not Found'
          }, null);
      });
  });

  // Get messages of a discussion by Id
  router.get('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    Discussion.findById(req.params._id).populate('users', 'username firstName lastName photo')
      .exec(function(err, discussion) {
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

  // Create a Discussion with n users (POUR LAVENIR)
  router.post('/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    var str = req.body.usersId;
    var usersId = str.split(",").map(function(val) {
      return ObjectId(val);
    });
    var discussion = new Discussion({
      users: usersId
    });
    discussion.users.push(req.user._id);
    discussion.save(function(err, discussion) {
      if (err)
        next(err);
      else
        res.json(discussion);
    });
  });

  module.exports = router;
