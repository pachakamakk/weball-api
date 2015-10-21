var express = require('express');
var router = express.Router();
var Chat = require('../models/chat');
var User = require('../models/user');
var Auth = require('../middlewares/Auth');
var async = require('async');

/**
 **  GET /:_id Messages of a chat
 **  PATCH /join/:_id Join a chat 
 **  PATCH /leave/:_id Leave a chat
 **  PATCH /:_id Send a message to this chat id
 **/

// Join a chat
router.patch('/join/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  Chat.findById(req.params._id).exec(function(err, chat) {
    if (err)
      return next(err);
    else if (chat) {
      for (user of chat.users) {
        if (user.equals(req.user._id))
          return next({
            status: 405,
            message: 'Already Joined'
          }, null);
      }
      chat.users.push(req.user._id);

      chat.save(function(err, chat) {
        if (err)
          next(err);
        else
          res.json(chat);
      });
    } else
      return next({
        status: 404,
        message: 'Chat Not Found'
      }, null);
  });
});

// Leave a chat
router.delete('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  Chat.findById(req.params._id).select('users').exec(function(err, chat) {
    if (err)
      return next(err);
    else if (chat) {
      var index = chat.users.indexOf(req.user._id);
      if (index > -1)
        chat.users.splice(index, 1);
      chat.save(function(err, chat) {
        if (err)
          next(err);
        else
          res.json(chat);
      });
    } else
      return next({
        status: 404,
        message: 'Chat Not Found'
      }, null);
  });
});

// Get Messages of a chat
router.get('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  Chat.findById(req.params._id).populate('messages.createdBy', 'username firstName lastName photo')
    .select('messages')
    .exec(function(err, chat) {
      if (err) {
        return next(err);
      } else if (chat) {
        res.json(chat);
      } else
        return next({
          status: 404,
          message: 'Chat Not Found'
        }, null);
    });
});

// Send a message to a chat
router.patch('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  Chat.findById(req.params._id).exec(function(err, chat) {
    if (err)
      return next(err);
    else if (chat) { // Add Message 
      var index = chat.users.indexOf(req.user._id);
      if (index == -1) {
        return next({
          status: 405,
          message: "User isn't in the chat"
        }, null);
      }
      chat.messages.push({
        content: req.body.content,
        createdAt: new Date(),
        createdBy: req.user._id
      });
      chat.save(function(err, chat) {
        if (err)
          return next(err);
        else
          res.json(chat)
      });
    } else
      return next({
        status: 404,
        message: "Chat Not Found"
      }, null);
  });
});

module.exports = router;
