// Chat schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Message', {
  senderId: {
    type: ObjectId,
    required: true
  },
  discussion: {
    type: ObjectId,
    required: true
  },
  creation_date: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
    required: true,
  }
});
