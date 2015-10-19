  /*
   ** Header
   **
   ** Created By Elias CHETOUANI
   ** Created At 03/09/15
   ** Functions For Matchs
   */

  var express = require('express');
  var router = express.Router();
  var Notification = require('../models/notification');

  var NotificationProvider = function(properties) {
    for (var key in properties) {
      this[key] = properties[key];
    }
  };

  NotificationProvider.prototype.get = function(query, fields, options, callback) {

    if (typeof fields === 'function') {
      callback = fields;
      fields = null;
    }

    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    
    if (typeof query._id === "string") {
      if (!mongoose.Types.ObjectId.isValid(query._id)) {
        return next({
          status: 449,
          message: 'Invalid user id'
        }, null);
      }
    }

    Notification.find(query, fields, options).exec(function(err, notifications) {
      callback(err, notifications);
    });
  }

  NotificationProvider.prototype.create = function(query, fields, options, callback) {
  	var notification = new Notification({
  		user:,
  		type:
  		content:
  		read: false
  	});
  }

  module.exports = router;