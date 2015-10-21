// Load required packages
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var TokenSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  expire: {
    type: Date,
    required: true
  },
  application: {
    appId: String,
    deviceToken: String,
    deviceType: String, // 'ios'
    createdAt: Date,
    status: String //'active'
  }
});
// Export the Mongoose model
module.exports = mongoose.model('Token', TokenSchema);