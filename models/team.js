// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Team', {
  name: {
    type: String,
    required: true
  },
  match: {
    type: ObjectId,
    ref: 'Match',
    default: null
  },
  registerDate: {
    type: Date,
    default: Date.now
  },
  players: {
    type: [ObjectId],
    ref: 'User',
    default: []
  },
  leader: {
    type: ObjectId,
    ref: 'User',
    required: true
  }
});