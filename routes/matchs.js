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
 var Field = require('../models/field');
 var Team = require('../models/team');
 var User = require('../models/user');
 var Auth = require('../middlewares/Auth');
 var async = require('async');
 var mongoose = require('mongoose');
 var ObjectId = mongoose.Types.ObjectId;

 /**
  ** GET  matchs list of the current user
  ** GET:id get match from his id
  ** POST add match
  ** POST :id register current user to this match
  **/

 // Get 1 match by Id
 router.get('/:_id', function(req, res, next) {
   Match.findById(req.params._id, function(err, match) {
     if (err) next(err);
     else res.json(match);
   });
 });

 // Create a new Match By Field and Join
 router.post('/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   var matchCreated = {};
   var amount = 0;

   // If Date exist and correct: Need 1h or 30min.
   var ONE_HOUR = 1000 * 60 * 60;
   var duration = (new Date(req.body.end_date)).getTime() - (new Date(req.body.start_date)).getTime()
   duration = (duration / ONE_HOUR);
   if (duration != 1 && duration != 0.5) {
     return next({
       status: 449,
       message: 'Invalid date: 1h or 30min'
     }, null);
   }

   // TO DO: Check if the user there aren't booking in this date in other five.
   /* Step 1: Check if the five is open for this date and Get Amount By Date  
    ** Step 2: Check if this slot is already booked, else create match, create team.
    ** Step 3: Store Match id in the User.
    **
    */
   async.series([

       // Step 1
       function getAmountByDate(callback) {
         var dayStart = new Date(req.body.start_date).getDay();
         var hourStart = new Date(req.body.start_date).getUTCHours(); // use UTC sinon décalage GMT+2
         Field.findById(req.body.fieldId).select({
           pricesPerHour: 1,
           pricesPerHalf: 1,
           _id: 0
         }).exec(function(err, field) {
           if (err) return next(err);
           else if (field) {
             if (field.pricesPerHour[dayStart] && duration == 1) {
               var keysbyindex = Object.keys(field.pricesPerHour[dayStart]);
               for (var i = 0; i < keysbyindex.length; i++)
                 if (hourStart >= keysbyindex[i] && hourStart < keysbyindex[i + 1]) {
                   amount = field.pricesPerHour[dayStart][keysbyindex[i]];
                 }
             } else if (field.pricesPerHalf[dayStart] && duration == 0.5) {
               var keysbyindex = Object.keys(field.pricesPerHalf[dayStart]);
               for (var i = 0; i < keysbyindex.length; i++)
                 if (hourStart >= keysbyindex[i] && hourStart < keysbyindex[i + 1]) {
                   amount = field.pricesPerHalf[dayStart][keysbyindex[i]];
                 }
             }
             if (amount > 0)
               callback();
             else {
               var err = new Error('Invalid Date: this five is closed at this date');
               err.status = 449;
               return next(err);
             }
           } else {
             var err = new Error('No such Field');
             err.status = 401;
             return next(err);
           }
         });
       },

       // Step 2
       function CreateMatch(callback) {
         Match.findOne({
           fieldId: req.body.fieldId,
           $or: [{
             "start_date": {
               "$gte": req.body.start_date,
               "$lt": req.body.end_date
             }
           }, {
             "end_date": {
               "$gt": req.body.start_date,
               "$lte": req.body.end_date
             }
           }]
         }).exec(function(err, match) {
           if (err) return callback(err, null);
           else if (match) {
             return callback({
               status: 449,
               message: 'Slot is already booked'
             }, null);
           } else {
             var match = new Match({
               name: req.body.name,
               start_date: req.body.start_date,
               end_date: req.body.end_date,
               created_at: new Date(),
               status: "waiting",
               fieldId: req.body.fieldId,
               amount: amount,
               created_at: req.body.created_at,
               created_by: req.user._id
                 //teams: req.body.team //
             });
             match.save(function(err, match) {
               if (err) return callback(err);
               else {
                 var team = new Team({
                   name: req.body.teamName || "Equipe A",
                   matchId: match._id,
                   playersId: req.user._id,
                   leaderId: req.user._id,
                   registerDate: new Date()
                 });
                 var teamB = new Team({
                   name: "Equipe B",
                   matchId: match._id
                 });
                 team.save(function(err, team) {
                   if (err) return callback(err);
                   // Ajouter les équipes dans le document matchs ?
                   teamB.save(function(err, team) {
                     if (err) return callback(err);
                     matchCreated = match;
                     callback();
                   });
                 });
               }
             });
           }
         });
       },

       //Step 3
       function StoreMatchInUser(callback) {
         User.findOneAndUpdate({
           _id: req.user._id
         }, {
           $push: {
             matchsId: matchCreated._id
           }
         }).exec(function(err, updated) {
           if (err)
             return next(err);
           callback();
         });
       }
     ],
     function(err, result) {
       if (err) // if a function series fail 
         return next(err);
       else
         res.json(matchCreated);
     });
 });

 //Join a Match By Id 
 // Conditions: Au moins une place libre dans les équipes et que le status soit en waiting
 router.patch('/join/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   /*
    ** Step 1: Vérifier le statut du match.
    ** Step 2: Check if there is a free spot in a team, 
    **         then join the team with req.body.teamId.
    */

   var _match = {};
   var _team = {};

   async.series([
       // Step 1
       function matchIsAvailableToJoin(callback) {
         Match.findById(req.params._id, function(err, match) {
           if (err) return callback(err);
           else if (!match) {
             return callback({
               status: 404,
               message: 'Match Not Found'
             }, null);
           } else if (match.status === "waiting") {
             _match = match;
             callback();
           } else {
             return callback({
               status: 405,
               message: 'The match is: ' + match.status
             }, null);
           }
         });
       },

       // Step 2
       function joinATeam(callback) {
         Team.find({
           matchId: req.params._id
         }, function(err, team) {
           if (err) return callback(err);
           else if (team) {
             for (eachTeam of team)
               for (playerId of eachTeam.playersId) // pour chaque joueur d'une équipe
                 if (playerId.toString() == req.user._id)
                   return (callback({
                     status: 405,
                     message: 'You are already registred in the team: ' + eachTeam._id
                   }, null));
             for (var i = 0; i < team.length; i++) {
               if (team[0]._id != req.body.teamId && team[1]._id != req.body.teamId) { // check if teamId doesn't exist
                 return callback({
                   status: 404,
                   message: 'teamId is not found'
                 }, null);
               }
               if (team[i]._id.toString() === req.body.teamId) {
                 if (team[i].playersId.length >= (_match.maxPlayers / 2))
                   return (callback({
                     status: 405,
                     message: 'Max players: ' + (_match.maxPlayers / 2).toString()
                   }, null));
                 else { // save team with the id of user
                   team[i].playersId.push(req.user._id);
                   team[i].save(function(err, teamSaved) {
                     if (err) return callback(err);
                     else if (team[0].playersId.length >= (_match.maxPlayers / 2) &&
                       team[1].playersId.length >= (_match.maxPlayers / 2)
                     ) {
                       _match.status = "ready";
                       _match.save(function(err, match) {
                         if (err) return callback(err);
                       });
                     } else {
                       _team = teamSaved;
                       return callback();
                     }
                   });
                 }
               }
             }
             //  callback();
           } else {
             return callback({
               status: 404,
               message: 'Team is not found'
             }, null);
           }
         });
       }
     ],
     function allIsOk(err, result) {
       if (err) return next(err);
       else
         res.json(_team);
     });
 });

 router.route('/:my')
   .get(function(req, res, next) {
     Match.find({
       teamsId: req.user.team
     }, function(err, res) {
       if (err) next(err);
       else res.json(matchs);
     });
   });

 // Update Partial Ressource of a match
 router.patch('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   Match.findById(req.params._id).exec(function(err, match) {
     if (err)
       next(err);
     else if (match) {
       if (match.created_by.toString() != req.user._id.toString())
         return next({
           status: 405,
           message: 'Only Creator can modify the match'
         }, null);
       else
         Match.update({
           _id: req.params._id
         }, req.body, function(err, savedMatch) {
           if (err) return next(err);
           res.json(savedMatch);
         });
     } else
       return next({
         status: 404,
         message: 'Match is not found'
       }, null);
   });
 })

 module.exports = router;
