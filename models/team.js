// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Team', {
  name: { type: String, required: true },
  terrainId: {type: ObjectId, required:true},
  matchId: {type: ObjectId, default: null},
  registerDate: {type: Date, default: Date.now},
  userIds: { type: [ObjectId], required: true },
  leaderId: { type: ObjectId, required:true}
});