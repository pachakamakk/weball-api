// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    match: /^[a-z A-Z]{1,20}$/,
    required: true
  },
  registerDate: {
    type: Date
  },
  playersId: [{
    type: ObjectId,
    ref: 'User'
  }],
  leaderId: {
    type: ObjectId,
    ref: 'User'
      //  required: true
  }
});

module.exports = mongoose.model('Team', TeamSchema);
