// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var NotificationSchema = new mongoose.Schema({
  list: [{
    type: {
      type: String, //match, friend, 
      required: true
    },
    content: {
      type: ObjectId,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
    read: {
      type: Boolean,
      default: false
    },
  }],
  user: {
    type: ObjectId,
    ref: 'User'
    required: true
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);