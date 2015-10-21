// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var InvitationSchema = new mongoose.Schema({
  match: {
    type: ObjectId,
    ref: 'Match',
    unique: true,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  invited: [{
    by: {
      type: ObjectId,
      ref: 'User', //
      required: true
    },
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: Boolean,
      default: false
    }
  }],
});

module.exports = mongoose.model('Invitation', InvitationSchema);
