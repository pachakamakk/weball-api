// Terrain schema

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

module.exports = mongoose.model('Field', {
  available: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  calendar: {
    type: [{
      available: Boolean,
      status: String,
      amount: String,
      matchId: ObjectId,
      date: Number, // Date for moment test with number
    }],
    ref: 'Match'
  },
  five: {
    type: ObjectId,
    ref: 'Five'
  }
});