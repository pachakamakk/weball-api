var express = require('express');
var router = express.Router();
var Match = require('../models/match');
var isAuth = require('../middlewares/validateToken');

/**
 ** GET  matchs list of the current user
 ** GET:id get match from his id
 ** POST add match
 ** POST :id register current user to this match
**/

router.route('/')

.get(isAuth, function(req, res, next){
  if (req.user.hasTeam)
    Match.find(function(err, matchs) {
      if (err) next(err);
      else res.json(matchs);
    });
  else
    res.json({});
})

.post(isAuth, function(req, res, next){
  var match = new Match({
    state : Match.WAITING,
    gameDate : req.body.date
  });
  match.teamIds = [];
  for (var i in req.body.teams.length) {
    teamId = req.body.teams[i];
    match.teamIds.push(teamId);
  }
  match.save(function(err) {
    if (err)
      next(err);
    else {
      match.teamIds.forEach(function(el){
        Team.update({_id : el}, {$set : {matchId : match._id}}, function(err){
          if (err) next (err);
        })
      });
      res.send(200);
    }
  });
});

router.route('/:id')

.get(isAuth, function(req, res, next){
  Match.find({_id : req.params.id}, function(err, match){
    if (err) next(err);
    else res.json(match);
  });
});

router.route('/:my')
.get(isAuth, function(req, res, next){
  Match.find({teamIds:req.user.teamId}, function(err, res){
    if (err) next(err);
    else res.json(matchs);
  });
})

/*
.delete(isAuth, function(req, res, next){
  Match.remove({_id : req.params.id }, function(err){
    if (err) next(err);
    else res.send(200);
  });
});
*/

module.exports = router;
