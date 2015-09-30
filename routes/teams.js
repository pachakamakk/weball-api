/*
 ** Header
 **
 ** Created By Elias CHETOUANI
 ** Created At 16/09/2015
 ** Functions: GET, POST, PATCH
 */

// Dependances
var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var Match = require('../models/match');
var async = require('async');


// Get a Team By Id
router.get('/:_id', function(req, res, next) {
  Team.findById(req.params._id, function(err, team) {
    if (err) next(err);
    else res.json(team);
  });
})

// Create a Team For a Match
.post('/', function(req, res, next) {
  var _team;
  async.series([
      // Step 1
      function matchIsAvailableToJoin(callback) {
        Match.findById(req.body.matchId, function(err, match) {
          if (err) return callback(err);
          else if (!match)
            return callback({
              status: 404,
              message: 'Match Not Found'
            }, null);
          else if (match.status === "waiting")
            callback();
          else
            return callback({
              status: 405,
              message: 'The match is: ' + match.status
            }, null);
        });
      },

      // Step 2: 1 team Ok to create. 2 team already exist KO
      function maxTeam(callback) {
        Team.count({
          matchId: req.body.matchId
        }, function(err, teams) {
          if (err) return callback(err);
          else if (teams < 2)
            callback();
          else if (teams >= 2)
            return callback({
              status: 405,
              message: 'Max Team per Match: 2'
            }, null);
          else
            return callback({
              status: 404,
              message: 'Team Not Found'
            }, null);
        });

      },
      // Step 3
      function createTeam(callback) {
        var team = new Team({
          name: req.body.teamName || "Equipe A",
          matchId: req.body.matchId,
          players: req.body.playerId,
          leader: req.body.leaderId,
          registerDate: new Date(req.body.date)
        });
        team.save(function(err, team) {
          if (err) return callback(err);
          _team = team
          callback();
        });
      }
    ],
    function allIsOk(err, result) {
      if (err) return next(err);
      else
        res.json(_team)
    });
})

// Add a User in the Team
.patch(function(req, res, next) {
  Team.findByIdAndUpdate(req.params.id, function(err, team) {
    if (err) next(err);
    else res.json(team);
  })
});

module.exports = router;
