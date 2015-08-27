var express = require('express');
var router = express.Router();
var Match = require('../models/match');
var Team = require('../models/team');

/**
 ** GET  matchs list of the current user
 ** GET:id get match from his id
 ** POST add match
 ** POST :id register current user to this match
 **/

router.route('/')

.get(function(req, res, next) {
  if (req.user.hasTeam)
    Match.find(function(err, matchs) {
      if (err) next(err);
      else res.json(matchs);
    });
  else
    res.json({});
})

.post(function(req, res, next) {
  var match = new Match({
    gameDate: req.body.date,
    field: req.body.field,
    teams: []
  });
  var userTeam = new Team({
    name: req.body.team,
    match: match._id,
    leader: req.user._id,
    players: []
  });
  userTeam.save(function(err) {
    if (err) next(err);
    else {
      console.log(match);
      match.teams.push(userTeam._id);
      match.save(function(err) {
        if (err)
          next(err);
        else
          res.sendStatus(200);
      });      
    }
  });
});

router.route('/:id')

.get(function(req, res, next) {
  Match.find({
    _id: req.params.id
  }, function(err, match) {
    if (err) next(err);
    else res.json(match);
  });
});

router.route('/:my')
  .get(function(req, res, next) {
    Match.find({
      teams: req.user.team
    }, function(err, res) {
      if (err) next(err);
      else res.json(matchs);
    });
  });

module.exports = router;