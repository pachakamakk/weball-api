var mongoose = require('mongoose');
var roles = require('../utils/roles');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;


var FiveSchema = new mongoose.Schema({
  role: {
    type: Number,
    default: roles.FIVE
  },
  siren: {
    type: Number,
    index: {
      unique: true
    },
    required: true
  },
  owner: {
    type: ObjectId,
    required: true
  },
  fields: {
    type: [ObjectId],
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  postalCode: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  county: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  schedule: {
    type: Mixed,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  gps: {
    type: Mixed,
    required: true
  },
  registerDate: {
    type: Date,
    default: Date.now
  },
  user: {
    type: ObjectId,
    required: true,
    ref: 'User'
  }
});

module.exports = mongoose.model('Five', FiveSchema);