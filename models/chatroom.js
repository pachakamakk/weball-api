// Chatroom client schema
var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Chatroom',{
  senderId: { type: ObjectId, required: true },
  receiverId: { type: ObjectId, required: true },
  messages: [{
    date: {type : Date, required : true},
    data: {type : String, required : true}
  }],
  creation_date: { type: Date, default: Date.now}
});
