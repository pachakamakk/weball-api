  /*
   ** Header
   **
   ** Created By Elias CHETOUANI
   ** Created At 21/09/15
   ** Functions For Invitations Matches
   */

  var express = require('express');
  var router = express.Router();
  var Match = require('../models/match');
  var Invitation = require('../models/invitation');
  var Auth = require('../middlewares/Auth');
  var async = require('async');
  var mongoose = require('mongoose');
  var ObjectId = mongoose.Types.ObjectId;

  // Get invitations of matchs
  router.get('/matches', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    Invitation.find({
      'invited.user': req.user._id
    }).populate('match').exec(function(err, invitations) {
      if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
      res.json(invitations)
    });
  });

  // Invit a user to a Match
  router.patch('/matches/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    var _invitation = {};
    var double = false;

    async.series([
        function pushInvitation(callback) {
          var str = req.body.usersId;
          var usersId = str.split(",").map(function(val) {
            return ObjectId(val);
          });
          Invitation.findOne({
            match: req.params._id
          }).exec(function(err, invitation) {
            if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
            else if (invitation) {
              usersId.forEach(function(user) {
                if (!user.equals(req.user._id)) { // cannot invit yourself
                  for (invit of invitation.invited)
                  // cant invit a user already invited
                    if (invit.by.equals(req.user._id) && invit.user.equals(user))
                      double = true;
                  if (!double)
                    invitation.invited.push({
                      by: req.user._id,
                      user: user,
                      date: new Date()
                    });
                }
              });
              invitation.save(function(err, invitation) {
                if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
                _invitation = invitation;
                callback();
              });
            } else {
              var invitation = new Invitation({
                match: req.params._id,
                date: new Date(),
              });
              usersId.forEach(function(user) {
                if (!user.equals(req.user._id)) { // cannot invit yourself
                  for (invit of invitation.invited)
                  // cant invit a user already invited
                    if (invit.by.equals(req.user._id) && invit.user.equals(user))
                      double = true;
                  if (!double)
                    invitation.invited.push({
                      by: req.user._id,
                      user: user,
                      date: new Date()
                    });
                }
              });
              invitation.save(function(err, invitation) {
                if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
                _invitation = invitation;
                callback();
              });
            }
          });
        },
        function pushNotification(callback) {
          callback();
        },
      ], //5626af199ae8c8b68b97dcdd

      function allFinish(err, result) {
        if (err) return next(err);
        res.json(_invitation);
      });
  })

  // Delete invitation user to a Match
  router.delete('/matches/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    var _invitation = {};
    var double = false;
    var str = req.body.usersId;
    var usersId = str.split(",").map(function(val) {
      return ObjectId(val);
    });

    Invitation.findOneAndUpdate({
      match: req.params._id
    }, {
      "$pull": { // search user in array of invited
        "invited": {
          "by": req.user._id,
          "user": {
            "$in": usersId
          }
        },
      }
    }, {
      "new": true // return doc updated
    }).exec(function(err, invitation) {
      if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
      else if (invitation) {
        res.json(invitation)
      } else {
        return callback({
          status: 404,
          message: 'Invitation is not found'
        }, null);
      }
    });
  });

  module.exports = router;
