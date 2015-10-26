// Friends schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Friend', {
  user: {
    type: ObjectId,
    ref: 'User'
  },
  nbFriends: {
    type: Number,
    min: 0
  },
  list: [{
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    requester: {
      type: ObjectId,
      ref: 'User',
      required: true
    }
  }]
});