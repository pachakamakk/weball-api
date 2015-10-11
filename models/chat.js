// Chatroom schema for a match

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
    infoUser: {
      username: String,
      firstName: String,
      lastName: String,
      photo: String
    }
  }],
  matchId: ObjectId // for a Chat
});