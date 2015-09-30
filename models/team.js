// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  matchId: {
    type: ObjectId,
    ref: 'Match',
    default: null
  },
  registerDate: {
    type: Date
  },
  playersId: {
    type: [ObjectId],
    ref: 'User',
    default: []
  },
  leaderId: {
    type: ObjectId,
    ref: 'User'
      //  required: true
  }
});

module.exports = mongoose.model('Team', TeamSchema);