// Friends schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('FriendRequest', {
  to: {
    type: ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true
  },
  from: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true
  },
});