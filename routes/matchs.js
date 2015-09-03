/*
 ** Header
 **
 ** Created By Elias CHETOUANI
 ** Created At 03/09/15
 ** Functions For Matchs
 */


var express = require('express');
var router = express.Router();
var Match = require('../models/match');
var Team = require('../models/team');
var async = require('async');

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

// Create a new Match By Field
.post(function(req, res, next) {
  // Trouver match avec le meme créneau
  // Si match existe alors renvoyer slot déja pris
  // Sinon 
  // Vérifier si aucun match n'existe à cette date pour ce five et ce terrain.
  // Enregistrer le match et le mettre en attente ou complet selon si c'est un match privée ou public

  // var match = new Match({
  //   status: req.body.state,
  //   start_date: req.body.start_date,
  //   end_date: req.body.end_date,
  //   fieldId: req.body.fieldId,
  //   created_at: req.body.created_at,
  //   teams: [] // ADD USER IN TEAM 
  // });
  // match.save(function(err, match) {
  //   if (err) return next(err);
  //   else
  //     res.json(match);
  // })

  async.series([
      // Check if this slot is Already Booked

      function isBooked(callback) {
        Match.find({
          fieldId: req.body.fieldId,
          start_date: req.body.start_date,
          end_date: req.body.end_date
        }).exec(function(err, match) {
          if (err) callback(err, null);
          else if (match[0]) {
            console.log(match);
            callback({
              status: 449,
              message: 'Slot is already booked'
            }, null);
          } else
            callback();
        })
      },

      function B(callback) {
        console.log("B");
        callback();
      }
    ],
    function(err) { //This function gets called after the two tasks have called their "task callbacks"
      if (err) return next(err);
      else
        res.json("ok");
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

// Private
function isBooked(_fielId, _start, _end, callback) {
  // Match.find({
  //   fieldId: _fielId
  // }).exec(function(err, match) {
  //   if (err) callback(err, null);
  //   else callback();
  // })

}

module.exports = router;