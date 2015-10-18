// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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