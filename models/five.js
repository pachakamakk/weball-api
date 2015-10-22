var mongoose = require('mongoose');
var roles = require('../utils/roles');
var ObjectId = mongoose.Schema.Types.ObjectId;

var FiveSchema = new mongoose.Schema({
  siren: {
    type: Number,
    index: {
      unique: true
    },
    required: true
  },
  fields: [{
    type: ObjectId,
    ref: 'Field'
  }],
  name: {
    type: String,
    required: true
  },
  zipCode: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  gps: {
    longitude: String,
    latitude: String
  },
  photo: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  admins: [{
    type: ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Five', FiveSchema);
