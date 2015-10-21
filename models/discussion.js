// Chat schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Discussion', {
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