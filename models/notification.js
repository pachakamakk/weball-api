// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var NotificationSchema = new mongoose.Schema({
  type: {
    type: String, //Player Join
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
  user: {
    type: ObjectId,
    ref: 'User'
    required: true
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);