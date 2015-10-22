// Team schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var InvitationSchema = new mongoose.Schema({
  match: {
    type: ObjectId,
    ref: 'Match',
    required: true,
    index: {
      unique: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  invited: [{
    by: {
      type: ObjectId,
      ref: 'User',
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

var options = {
  populate: {
    'match.created_by': {
      select: 'firstName lastName photo username',
    }
  }
}

InvitationSchema.plugin(deepPopulate, options);
module.exports = mongoose.model('Invitation', InvitationSchema);
