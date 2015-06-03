// Match schema
var mongoose = require('mongoose');
var ObjectId= mongoose.Schema.Types.ObjectId;
var status = require('../utils/matchStatus');

function arrayLimit(t) {
  return t.length <= 2;
}

module.exports = mongoose.model('Match', {
  state: { type: Number, default: status.WAITING },
  gameDate: {type: Date, required: true },
  registerDate: {type: Date, default: Date.now},
  field: { type: ObjectId, required: true },
  teams: {
    type: [ObjectId],
    validate: [arrayLimit, '2 équipes par match!']
  }
});
