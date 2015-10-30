  /*
   ** Header
   **
   ** Created By Elias CHETOUANI
   ** Created At 25/09/15
   ** Functions For Friends Relations Ship with friends-of-friends module
   */

  var express = require('express');
  var router = express.Router();
  var Auth = require('../middlewares/Auth');
  var FriendRequest = require('../models/friendsrequest');
  var Friend = require('../models/friend');
  var async = require('async');
  var User = require('../models/user');

  // Send Friend Requests
  router.post('/request/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    if (req.user._id.equals(req.params._id))
      return next({
        status: 405,
        message: "You can't invite yourself"
      }, null);

    async.parallel([
        function userExist(callback) {
          User.findById(req.params._id, function(err, user) {
            if (err) return callback(err);
            else if (user)
              callback();
            else
              return callback({
                status: 404,
                message: 'User Not Exist'
              }, null);
          });
        },

        function requestExist(callback) {
          FriendRequest.findOne({
            $or: [{
              to: req.params._id,
              from: req.user._id
            }, {
              from: req.params._id,
              to: req.user._id
            }]
          }, function(err, request) {
            if (err) return callback(err);
            else if (request) {
              return callback({
                status: 405,
                message: 'Request Already exist'
              }, null);
            } else
              callback();
          });
        },

        function userAlreadyInFriendList(callback) {
          Friend.findOne({
            user: req.user._id,
            'list.user': req.params._id
          }, function(err, friendList) {
            if (err) return callback(err);
            else if (friendList) {
              return callback({
                status: 405,
                message: 'User is already friend'
              }, null);
            } else
              callback();
          });
        }
      ],

      function createFriendRequest(err, result) {
        if (err) return next(err);
        else {
          var friendRequest = new FriendRequest({
            to: req.params._id,
            date: new Date(),
            from: req.user._id,
            status: "pending"
          });
          friendRequest.save(function(err, friendrequest) {
            if (err) return next(err);
            else
              res.json(friendrequest);
          });
        }
      });
  })

  // Deny Friend Requests
  .delete('/request/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    FriendRequest.findOne({
      $or: [{
        to: req.params._id,
        from: req.user._id
      }, {
        from: req.params._id,
        to: req.user._id
      }]
    }, function(err, request) {
      if (err) return next(err);
      else if (request) {
        request.remove(function(err, removed) {
          if (err) return next(err);
          else
            res.json(removed);
        });
      } else
        return next({
          status: 404,
          message: "Request Doesn't exist"
        }, null);
    });
  })

  // Accept Friend Requests
  .patch('/request/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    var _request = {};
    var _myFriendList = {};

    async.series([
        function findRequest(callback) {
          FriendRequest.findOne({
            to: req.user._id,
            from: req.params._id
          }, function(err, request) {
            if (err) return next(err);
            else if (request) {
              _request = request;
              callback();
            } else
              return next({
                status: 405,
                message: "Request Doesn't exist"
              }, null);
          });
        },

        function addUserIntoMyFriendList(callback) {
          var conditions = {
              user: req.user._id
            },
            update = {
              $inc: {
                nbFriends: 1
              },
              $push: {
                list: {
                  user: req.params._id,
                  date: new Date(),
                  requester: _request.from
                }
              }
            },
            options = {
              upsert: true,
              runValidators: true
            };
          Friend.update(conditions, update, options, function(err, friendList) {
            if (err) return callback(err);
            else if (friendList) {
              _myFriendList = friendList;
              callback();
            } else
              return callback({
                status: 405,
                message: 'Impossible to add user: ' + req.params._id + ' in FriendList'
              }, null);
          });
        },

        function addUserIntoFriendListUser(callback) {
          var conditions = {
              user: req.params._id
            },
            update = {
              $inc: {
                nbFriends: 1
              },
              $push: {
                list: {
                  user: req.user._id,
                  date: new Date(),
                  requester: _request.from
                }
              }
            },
            options = {
              upsert: true,
              runValidators: true
            };
          Friend.update(conditions, update, options, function(err, friendList) {
            if (err) return callback(err);
            else if (friendList) {
              callback();
            } else
              return callback({
                status: 405,
                message: 'Impossible to add user:' + req.user._id + ' in FriendList'
              }, null);
          });
        }
      ],

      function removeFriendRequest(err, result) {
        if (err) return next(err);
        _request.remove(function(err) {
          if (err) return next(err);
          else
            res.json(_myFriendList);
        });
      });
  })

  // Get Friends Requests 
  .get('/requests/my/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    FriendRequest.find({
      to: req.user._id
    }).populate('from', 'username firstName lastName photo location').exec(function(err, requests) {
      if (err) return next(err);
      else if (requests) {
        res.json(requests);
      } else
        return next({
          status: 404,
          message: "No Friend Requests"
        }, null);
    });
  })

  // Get Friends
  .get('/users/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    Friend.findOne({
      user: req.params._id
    }).populate('list.user', 'username firstName lastName photo location').exec(function(err, friend) {
      if (err) return next(err);
      else if (friend) {
        res.json(friend);
      } else
        return next({
          status: 404,
          message: "No Friends"
        }, null);
    });
  })

  // Delete Friend
  .delete('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    var _myFriendList = {};

    if (req.user._id.equals(req.params._id))
      return next({
        status: 405,
        message: "You can't delete yourself"
      }, null);

    async.parallel([
        function removeUserIntoMyFriendList(callback) {
          var conditions = {
            user: req.user._id
          };

          Friend.findOne(conditions).exec(function(err, friendList) {
            if (err) return callback(err);
            else if (friendList) {
              for (item of friendList.list) {
                if (item.user.equals(req.params._id)) {
                  item.remove();
                  friendList.nbFriends = friendList.nbFriends - 1;
                  break;
                }
              }
              friendList.save(function(err, saved) {
                if (err) return callback(err);
                _myFriendList = saved;
                return callback();
              });
            } else
              return callback({
                status: 405,
                message: 'Impossible to pull user: ' + req.params._id + ' in FriendList'
              }, null);
          });
        },

        function removeUserIntoFriendListUser(callback) {
          var conditions = {
            user: req.params._id
          };

          Friend.findOne(conditions, function(err, friendList) {
            if (err) return callback(err);
            else if (friendList) {
              for (item of friendList.list) {
                if (item.user.equals(req.user._id)) {
                  item.remove();
                  friendList.nbFriends = friendList.nbFriends - 1;
                  break;
                }
              }
              friendList.save(function(err) {
                if (err) return callback(err);
                return callback();
              });
            } else
              return callback({
                status: 405,
                message: 'Impossible to pull user:' + req.user._id + ' in FriendList'
              }, null);
          });
        }
      ],

      function allRemoved(err, result) {
        if (err) return next(err);
        res.json(_myFriendList);
      });
  })

  module.exports = router;