var express = require('express');
var router = express.Router();
var Chatroom = require('../models/chatroom');
var isAuth = require('../middlewares/validateToken');

/**
 **  GET List chatrooms of current user
 **  GET:id get chatroom with current user as sender
 **  POST create chatroom
**/

router.route('/')
.get(isAuth, function(req, res, next){
  Chatroom.find({ $or:[ {'senderId' : req.user._id}, {'receiverId' : req.body.receiverId} ] },
    function(err, rooms) {
      if (err) next(err);
      else res.json(rooms);
    });

})
.post(isAuth, function(req, res, next){
  var chatroom = new Chatroom({
    senderId:req.user._id,
    receiverId:req.body.receiverId
  });
  chatroom.save(function(err){
    if (err) next(err);
    else res.sendStatus(200);
  });
});

router.route('/:id')
.get(function(req, res, next) {
  Chatroom.findById(req.params.id, function(err, chatroom) {
    if (err) next(err);
    else res.json(chatroom);
  });
});

module.exports=router;
