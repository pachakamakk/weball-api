var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var validateToken = require('../middlewares/validateToken');


/**
 ** GET list teams
 ** POST add team ; take match id and team name in params
 ** GET:id get team from id
 **/

router.route('/')
  .get(validateToken, function(req, res, next) {
    Team.find({
      userIds: req.user._id
    }, function(err, team) {
      if (err) next(err);
      else res.json(team);
    });
  })
  .post(validateToken, function(req, res, next) {
    var team = new Team();
    team.name = req.body.name;
    team.leader = req.user._id;
    team.users = [];
    for (var i in req.body.users.length) {
      var userID = req.body.users[i];
      team.users.push(userId);
    }
    team.save(function(err) {
      if (err) next(err);
      else res.sendStatus(200);
    })
  });

router.route('/:id')
  .get(validateToken, function(req, res, next) {
    Team.findById(req.params.id, function(err, team) {
      if (err) next(err);
      else res.json(team);
    })
  });

module.exports = router;