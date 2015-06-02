var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var isAuth = require('../middlewares/validateToken');


/**
 ** GET list teams
 ** POST add team ; take match id and team name in params
 ** GET:id get team from id
**/

router.route('/')

.get(isAuth, function(req, res){
  Team.find({userIds : req.user._id}, function(err, team){
    if (err) next(err);
    else res.json(team);
  });
})

.post(isAuth, function(req, res){
  var team = new Team();
  team.name = req.body.name;
  team.leaderId = req.user._id;
  team.userIds = [];
  for (var i in req.body.userIds.length) {
    var userId = req.body.userIds[i];
    team.userIds.push(userId);
  }
  team.save(function(err) {
    if (err) next(err);
    else res.send(200);
  })
});

router.route('/:id')
.get(isAuth, function(req, res){
  Team.findById(req.params.id, function(err, team){
    if (err) next(err);
    else res.json(team);
  })
})

module.exports = router;
