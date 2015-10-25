// Terrain schema

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

module.exports = mongoose.model('Field', {
  available: {
    type: Boolean,
    required: true
  },
  name: {
    type: String,
    match: /^[a-z0-9 A-Z-_.]{1,20}$/,
    required: true
  },
  five: {
    type: ObjectId,
    ref: 'Five',
    required: true
  },
  photo: {
    type: String,
    match: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,20})([\/\w \.-]*)*\/?$/
  },
  pricesPerHour: {
    0: Mixed, // Dimanche
    1: Mixed,
    2: Mixed,
    3: Mixed,
    4: Mixed,
    5: Mixed,
    6: Mixed
  },
  pricesPerHalf: {
    0: Mixed,
    1: Mixed,
    2: Mixed,
    3: Mixed,
    4: Mixed,
    5: Mixed,
    6: Mixed
  }
});
