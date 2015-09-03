// Match schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

function arrayLimit(t) {
  return t.length <= 2;
}

module.exports = mongoose.model('Match', {
  status: {
    type: String, // Waiting: Players, Completed: Ready, Over: Finish
    default: "waiting"
  },
  start_date: {
    type: Date,
    // required: true
  },
  end_date: {
    type: Date,
    // required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  fieldId: {
    type: ObjectId,
    required: true
  },
  teamsId: {
    type: [ObjectId],
    validate: [arrayLimit, '2 équipes par match!']
  }
});