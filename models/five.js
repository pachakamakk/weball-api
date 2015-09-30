var mongoose = require('mongoose');
var roles = require('../utils/roles');
var ObjectId = mongoose.Schema.Types.ObjectId;


var FiveSchema = new mongoose.Schema({
  siren: {
    type: Number
    // index: {
    //   unique: true // Mode dev desac
    // },
    // required: true
  },
  fields: {
    type: [ObjectId],
    ref: 'Field'
      // required: true
  },
  name: {
    type: String,
   // unique: true,
    // required: true
  },
  zipCode: {
    type: Number,
    //  required: true
  },
  city: {
    type: String,
    //  required: true
  },
  country: {
    type: String,
    //required: true
  },
  address: {
    type: String,
    // required: true
  },

  // schedule: {
  //   type: Mixed,
  //   required: true
  // },
  phone: {
    type: String,
    //  required: true
  },
  gps: {
    longitude: String,
    latitude: String
  },
  // required: true
  registerDate: {
    type: Date,
    default: Date.now
  },
  admins: { //admin
    type: [ObjectId], 
    //  required: true,
    ref: 'User'
  }
});

module.exports = mongoose.model('Five', FiveSchema);