// Match schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

function arrayLimit(val) {
  return val.length <= 2;
}

function dateMin(val) {
 return val >= new Date() + (1000 * 60 * 60 * 48);
}

module.exports = mongoose.model('Match', {
  name: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true,
    min: 0,
    max: 150
  },
  currentPlayers: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 8,
    max: 10
  },
  status: {
    type: String, // waiting, ready, over
    required: true
  },
  start_date: {
    type: Date,
    min: Date.now() + (1000 * 60 * 60 * 48),
   // minimum 48h before the match
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  created_by: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  fieldId: {
    type: ObjectId,
    required: true
  },
  five: {
    type: ObjectId,
    required: true
  },
  chatId: {
    type: ObjectId
  },
  teamsId: {
    type: [{
      type: ObjectId,
      ref: 'Team'
    }],
    validate: [arrayLimit, 'exceeds the limit of 2 teams']
      // limit: 2
  }
});
