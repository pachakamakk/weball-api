// Chatroom schema for a match

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Chat', {
  users: [{
    type: ObjectId,
    ref: 'User'
  }],
  messages: [{
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    createdBy: {
      type: ObjectId,
      ref: 'User',
      required: true
    }
  }]
});