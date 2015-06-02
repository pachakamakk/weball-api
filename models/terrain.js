// Terrain schema

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

module.exports = mongoose.model('Terrain',{
  name: { type: String, unique: true, required: true },
  postalCode: {type : Number, required:true},
  city: {type: String, required: true},
  county: {type: String, required: true},
  adress: { type: String, required: true },
  schedule: {type: Mixed, required: true},
  price: {type: [Number], required:true},
  devise: {type: [Number], required:true},
  phone: {type: Number, required:true},
  gps: {type: Mixed, required: true},
  registerDate: {type: Date, default: Date.now},
  userId: { type: ObjectId, required: true }
});