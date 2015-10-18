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
      for (user of chat.usersId) {
        if (user.equals(req.user._id))
          return next({
            status: 405,
            message: 'Already Joined'
          }, null);
      }
      chat.usersId.push(req.user._id);
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
router.patch('/leave/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  Chat.findById(req.params._id).exec(function(err, chat) {
    if (err)
      return next(err);
    else if (chat) {
      var index = chat.usersId.indexOf(req.user._id);
      if (index > -1)
        chat.usersId.splice(index, 1);
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
  var chatWithUserInfo = [];
  Chat.findById(req.params._id).exec(function(err, chat) {
    if (err) {
      return next(err);
    } else if (chat) {
      chat.messages.forEach(function(message) {
        chatWithUserInfo.push(function(callback) {
          User.findById(message.createdBy).select({ //Get info of each user
              'username': 1,
              'firstName': 1,
              'lastName': 1,
              'photo': 1 })
            .exec(function(err, user) {
              if (err) callback(err);
              else if (!user) // user not found or deleted..
              {
                message.infoUser.photo = "";
                message.infoUser.username = "Utilisateur Introuvable";
                message.infoUser.firstName = "Utilisateur Introuvable";
                callback(null, message);
              } else {
                message.infoUser.photo = user.photo;
                message.infoUser.username = user.username;
                message.infoUser.firstName = user.firstName;
                message.infoUser.lastName = user.lastName;
                callback(null, message);
              }
            });
        });
      });
      async.parallel(chatWithUserInfo, function(err, result) {
        // this code will run after all get informations each user
        if (err)
          console.log(err);
        res.json(result);
      });
    } else
      return next({
        status: 404,
        message: 'Chat Not Found'
      }, null);
  });
});

// Send a message to a chat
router.patch('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  Chat.findById(req.params._id, function(err, chat) {
    if (err)
      return next(err);
    else if (chat) { // Add Message 
      var index = chat.usersId.indexOf(req.user._id);
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