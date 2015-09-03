// Terrain schema

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Field', {
  available: {
    type: Boolean,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  calendar: {
    type: [{
      status: String,
      amount: String,
      matchId: ObjectId,
      start_date: Date,
      end_date: Date  // Date for moment test with number
    }],
    ref: 'Match'
  },
  five: {
    type: ObjectId,
    ref: 'Five',
    required: true
  }
});