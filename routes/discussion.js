var express = require('express');
var router = express.Router();
var Discussion = require('../models/discussion');
var Message = require('../models/message');
var Auth = require('../middlewares/Auth');
var User = require('../models/user');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

/** /discussion POST : add a discussion
 **  param : [string] members (id1,id2,id3,...,idN)
 **
 ** /discussion PATCH : send a message
 ** param : discussion (id of discussion), message (content of the message)
 **
 ** /discussion/:discussion GET : get info and messages
 ** param : discussion (_id de la discussion)
 ** 
 **/

 router.route('/')
 .post(Auth.validateAccessAPIAndGetUser, function(req, res, next) {
	console.log(req.body.members);
	var str = req.body.members;
	var parsed_members = str.split(",").map(function (val) {
		return String(val);
	});
	var discussion = new Discussion({
		members: parsed_members,
		messages: []
	});
	discussion.members.push(req.user._id);
	discussion.save(function(err) {
        if (err)
          next(err);
        else {
		  res.json(discussion);
		}
      });
 })
 
 .patch(Auth.validateAccessAPIAndGetUser, function(req, res, next) {
	Discussion.findById(req.body.discussion).exec(function(err, discussion){
		if (err) next(err);
		if (discussion.members.indexOf(req.user._id) == -1) {
			var err = new Error('Not a member of this discussion');
            err.status = 401;
            return next(err);
		}
		var message = new Message({
			senderId: req.user._id,
			discussion: req.body.discussion,
			message: req.body.message
		});
		message.save(function(err){
			if (err) next(err);
		});
		discussion.messages.push(message._id);
		discussion.save(function(err){
			if (err) next(err);
			else res.sendStatus(200);
		});
	});
 });
 
 router.route("/:discussion")
 .get(Auth.validateAccessAPIAndGetUser, function(req, res, next) {
	Discussion.findById(req.params.discussion).exec(function(err, discussion){
			if (err)
				next(err);
			else if (!discussion) {
				console.log("Not found");
				res.sendStatus(420);
			}
			else {
				if (discussion.members.indexOf(req.user._id) == -1) {
					var err = new Error('Not a member of this discussion');
					err.status = 401;
					return next(err);
				}
				console.log(discussion.messages);
				if (discussion.messages.length > 0) {
					Message.find({'_id': {$in: discussion.messages}}, function(err, messages) {
						if (err) next(err);
						res.json({
							messages: messages,
							discussion: discussion
						});
					});
				}
				else {
					res.json({
							messages: [],
							discussion: discussion
					});
				}
			}
		});
});
 
 module.exports = router;