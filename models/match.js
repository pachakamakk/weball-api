// Match schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;


function arrayLimit(t) {
  return t.length <= 2;
}

module.exports = mongoose.model('Match', {
  state: {
    type: String, //Waiting: Players, Completed: Ready, Over: Finish
    default: "Waiting"
  },
  gameDate: {
    type: Date,
    required: true
  },
  registerDate: {
    type: Date,
    default: Date.now
  },
  field: {
    type: ObjectId,
    required: true
  },
  teams: {
    type: [ObjectId],
    validate: [arrayLimit, '2 équipes par match!']
  }
});