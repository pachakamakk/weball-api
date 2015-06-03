// Terrain schema

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

module.exports = mongoose.model('Field', {
  name: {
    type: String,
    unique: true,
    required: true
  },
  price: {
    type: [Number],
    required: true
  },
  // devise: {
  //   type: [Number],
  //   required: true
  // },
  five: {
    type: ObjectId,
    ref: 'Five'
  }
});