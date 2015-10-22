// Match schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

function arrayLimit(val) {
  return val.length <= 2;
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
    type: String, // waiting, ready, over, canceled
    required: true
  },
  start_date: {
    type: Date,
    min: Date.now() + (1000 * 60 * 60 * 48), // minimum 48h before the match
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
  private: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  fieldId: {
    type: ObjectId,
    ref: 'Field',
    required: true
  },
  five: {
    type: ObjectId,
    ref: 'Five',
    required: true
  },
  chatId: {
    type: ObjectId,
    ref: 'Chat'
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

