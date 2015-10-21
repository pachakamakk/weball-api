// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var InvitationSchema = new mongoose.Schema({
  match: {
    type: ObjectId,
    required: true
  },
  date: {
    type: Date
  },
  invited: [{
    by: {
      type: ObjectId, //
      required: true
    },
    user: {
      type: ObjectId,
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