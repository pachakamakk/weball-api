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
    required: true
  },
  five: {
    type: ObjectId,
    ref: 'Five',
    required: true
  },
  photo: {
    type: String
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
