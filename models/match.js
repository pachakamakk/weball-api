// Match schema
var mongoose = require('mongoose');
var ObjectId= mongoose.Schema.Types.ObjectId;

var WAITING = 'waiting';
var COMPLETED = 'completed';
var OVER = 'over';

function arrayLimit(t) {
  return t.length == 2;
}

module.exports = mongoose.model('Match', {
  state: { type: String, required: true },
  gameDate: {type: Date, required: true },
  registerDate: {type: Date, default: Date.now},
  terrainId: { type: ObjectId, required: true },
  teamIds: {
    type: [mongoose.Types.ObjectId],
    validate: [arrayLimit, '2 équipes par match!']
  }
});
