// Chat schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Discussion', {
  usersId: {
    type: [ObjectId]
  },
  lastUser: { // for get information for viewListMessages
    photo: String,
    firstName: String,
    lastName: String,
    username: String
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
    }
  }]
});