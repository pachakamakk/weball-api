// Match schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

function arrayLimit(t) {
  return t.length <= 2;
}

module.exports = mongoose.model('Match', {
  name: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true
  },
  status: {
    type: String, // waiting, ready, over
    required: true
  },
  start_date: {
    type: Date,
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
  }
});
