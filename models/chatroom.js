// Chatroom client schema for a match

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Chat', {
  usersId: {
    type: [ObjectId]
  },
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
      required: true
    },
    username: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      required: true
    }
  }],
  matchId: ObjectId // for a Chat
});
