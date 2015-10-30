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
    match: /^[a-z0-9 A-Z-_.]{1,20}$/,
    required: true
  },
  zipCode: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    match: /^[a-z A-Z-]{1,22}$/,
    required: true
  },
  country: {
    type: String,
    match: /^[a-z A-Z-]{1,22}$/,
    required: true
  },
  address: {
    type: String,
    match: /^[a-z0-9 A-Z-_.]{1,30}$/,
    required: true
  },
  phone: {
    type: String,
    match: /^\+?[0-9]{3}-?[0-9]{6,12}$/,
    required: true
  },
  gps: {
    longitude: Number,
    latitude: Number
  },
  photo: {
    type: String,
    match: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,20})([\/\w \.-]*)*\/?$/
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
