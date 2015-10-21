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
 var Chat = require('../models/chat');
 var Invitation = require('../models/invitation');
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

 // Get my matchs and sort 
 router.get('/me', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   /* req.query.sort: 'start_date' sort ascending
    ** req.query.sort: '-start_date' sort descending
    ** req.query.status: 'waiting'
    **/

   Match.find(req.user.matchs).sort(req.query.sort).where('status', req.query.status).exec(function(err, matchs) {
     if (err) next(err.errors[Object.keys(err.errors)[0]]);
     else res.json(matchs);
   });
 });

 // Get matchs by five and sort 
 router.get('/five/:_id', Auth.validateAccessAPIbyToken, function(req, res, next) {
   /* req.body.sort: 'start_date' sort ascending
    ** req.query.sort: '-start_date' sort descending
    ** req.query.status: 'waiting'
    **/

   Match.find({
     five: req.params._id
   }).sort(req.query.sort).where('status', req.query.status).exec(function(err, matchs) {
     if (err) next(err);
     else res.json(matchs);
   });
 });

 // Get invitations of matchs
 router.get('/invit/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   Invitation.findOne({
     'invited.user': req.user._id
   }).populate('match').exec(function(err, invitations) {
     if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
     res.json(invitations)
   });
 });

 // Get 1 match by Id
 router.get('/:_id', Auth.validateAccessAPIbyToken, function(req, res, next) {
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
   if (duration != 1 && duration != 0.5)
     return next({
       status: 449,
       message: 'Invalid date: 1h or 30min'
     }, null);

   // max Player need: PAIR
   if ((req.body.maxPlayers % 2) != 0)
     return next({
       status: 449,
       message: 'Invalid maxPlayers: Need PAIR Number'
     }, null);

   // TO DO: Check if the user there aren't booking in this date in other five.
   /* Step 1: Check if the five is open for this date and Get Amount By Date  
    ** Step 2: Check if this slot is already booked, else create match, create team.
    ** Step 3: Create a chat, join this chat, and add chatId in MatchId .
    ** Step 4: Store le MatchId in User
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
       function registredInOtherMatch(callback) {
         console.log(req.user.matchs)
         console.log(req.body.start_date)
         console.log(req.body.end_date)
         Match.findOne({
           _id: {
             '$in': req.user.matchs
           },
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
           if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
           else if (match) {
             return callback({
               status: 405,
               message: 'You participate an match at same date'
             }, null);
           }
           callback();
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
           if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
           else if (match) {
             return callback({
               status: 449,
               message: 'Slot is already booked: ' + match._id
             }, null);
           } else {
             // Create Team, Join and Store Id in the MatchSchema
             var team = new Team({
               name: req.body.teamNameA || "Equipe A",
               playersId: req.user._id,
               leaderId: req.user._id,
               registerDate: new Date()
             });
             var teamB = new Team({
               name: req.body.teamNameB || "Equipe B",
               registerDate: new Date()
             });
             team.save(function(err, team) {
               if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
               teamB.save(function(err, teamB) {
                 if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
                 var match = new Match({
                   name: req.body.name,
                   start_date: req.body.start_date,
                   end_date: req.body.end_date,
                   maxPlayers: req.body.maxPlayers,
                   status: "waiting",
                   fieldId: req.body.fieldId,
                   five: req.body.five,
                   amount: amount,
                   created_at: new Date(),
                   created_by: req.user._id,
                   currentPlayers: 1,
                   teamsId: team._id
                 });
                 match.teamsId.push(teamB._id);
                 match.save(function(err, match) {
                   if (err)
                     return callback(err.errors[Object.keys(err.errors)[0]]);
                   else {
                     matchCreated = match;
                     callback();
                   }
                 });
               });
             });
           }
         });
       },
       // Step 3
       function CreateAndJoinChat(callback) {
         var chat = new Chat({
           usersId: req.user._id,
           matchId: matchCreated._id
         });
         chat.save(function(err, chat) {
           if (err)
             return next(err); // faire: annuler les fonctions en haut
           else {
             Match.findByIdAndUpdate(matchCreated._id, {
               $push: {
                 chatId: chat._id
               }
             }, {
               new: true
             }, function(err, match) {
               if (err) {
                 return callback(err);
               } else {
                 matchCreated = match;
                 callback();
               }
             });
           }
         });
       },
       //Step 4
       function StoreMatchInUser(callback) {
         User.findOneAndUpdate({
           _id: req.user._id
         }, {
           $push: {
             matchs: matchCreated._id
           }
         }).exec(function(err, updated) {
           if (err)
             return next(err); // annuler toute les autres fonctions
           console.log(updated);
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

 // Join a Match By Id 
 // Conditions: Au moins une place libre dans les équipes et que le status du match soit en waiting
 router.patch('/join/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   /*
    ** Step 1: Vérifier le statut du match.
    ** Step 2: Check if there is a free spot in a team, 
    **         then join the team with req.body.teamId.
    */

   var _match = {};
   var _teamIds = [];
   var _team = {};

   async.series([
       // Step 1
       function matchIsAvailableToJoin(callback) {
         Match.findById(req.params._id, function(err, match) {
           if (err) return callback(err);
           if (match) {
             if (match.status != "waiting")
               return callback({
                 status: 405,
                 message: 'This match is: ' + match.status
               }, null);
             if (match.currentPlayers >= _match.maxPlayers)
               return callback({
                 status: 405,
                 message: 'This match is full'
               }, null);
             else {
               match.currentPlayers = match.currentPlayers + 1;
               if (match.currentPlayers == match.maxPlayers)
                 match.status = "ready";
               _match = match;
               _teamsId = JSON.parse(JSON.stringify(match.teamsId));
               callback();
             }
           } else {
             return callback({
               status: 404,
               message: 'Match Not Found'
             }, null);
           }
         });
       },
       function registredInOtherMatch(callback) {
         Match.findOne({
           _id: {
             '$in': req.user.matchs
           },
           start_date: req.body.start_date
         }).exec(function(err, match) {
           if (err) return callback(err);
           else if (match) {
             return callback({
               status: 405,
               message: 'You participate an match at same date'
             }, null);
           }
           callback();
         });
       },
       // Step 3
       function checkTeamVs(callback) {
         var index = _teamsId.indexOf(req.body.teamId)
         if (index > -1) // delete my teamId in order to get the Team Vs
           _teamsId.splice(index, 1);
         Team.findById(_teamsId, function(err, team) {
           if (err) return callback(err);
           else if (team) {
             // for (playerId of team.playersId) // pour chaque joueur d'une équipe
             //   if (playerId.toString() == req.user._id) {
             //     return callback({
             //       status: 405,
             //       message: 'You are already registred in the averse team: ' + team._id
             //     }, null);
             //   }
             callback();
           } else {
             return callback({
               status: 404,
               message: 'Match Not Found'
             }, null);
           }
         });
       },
       // Step 2
       function joinTeam(callback) {
         Team.findById(req.body.teamId, function(err, team) {
           if (err) return callback(err);
           else if (team) {
             //  for (playerId of team.playersId) // pour chaque joueur d'une équipe
             // if (playerId.toString() == req.user._id)
             //   return callback({
             //     status: 405,
             //     message: 'You are already registred in this team: ' + team._id
             //   }, null);
             team.playersId.push(req.user._id);
             _team = team;
             callback();
           } else {
             return callback({
               status: 404,
               message: 'Team is not found'
             }, null);
           }
         });
       }
     ],

     function saveAll(err, result) {
       if (err) return next(err);
       else {
         _team.save(function(err, team) {
           if (err) return next(err);
           console.log(_match);
           _match.save(function(err, match) {
             if (err) return next(err);
             User.update({
               _id: req.user._id
             }, {
               $push: {
                 matchs: match._id
               }
             }, function(err, result) {
               if (err) return next(err);
               res.json(team);
             });
           });
         });
       }
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
 });

 // Leave Match
 router.patch('/leave/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   var _match;

   async.series([
       // Step 1
       function removeUser(callback) {
         Match.findById(req.params._id)
           .populate('teamsId').exec(function(err, match) {
             if (err) callback(err);
             else if (match.teamsId) {
               var now = new Date();
               // if ((match.start_date - now) < (1000 * 60 * 60 * 48))
               //   return next({
               //     status: 405,
               //     message: 'Leave a match before: 48h'
               //   }, null);
               for (team of match.teamsId) {
                 var index = team.playersId.toString().indexOf(req.user._id);
                 if (req.user._id.equals(team.leaderId)) {

                   if (req.body.newLeader) // if there are a body.newLeader put it
                     team.leaderId = req.body.newLeader;
                   else { //put a random leader
                     var randomLeader = team.playersId[Math.floor(Math.random() * team.playersId.length)];
                     team.leaderId = randomLeader;
                   }
                 }
                 if (index > -1) { // delete my userId
                   team.playersId.splice(index, 1);
                   Team.update({
                     _id: team._id
                   }, team, function(err, teamSaved) {
                     if (err) return callback(err);
                     match.currentPlayers = match.currentPlayers - 1;
                     match.save(function(err, match) { // decremente currentPlayers
                       if (err) return callback(err);
                       User.update({
                         _id: req.user._id
                       }, {
                         $pull: {
                           matchs: match._id
                         }
                       }, function(err, result) {
                         if (err) return callback(err);
                         _match = match;
                         return callback();
                       })

                     });
                   });
                   return;
                 }
               }
               return callback({
                 status: 404,
                 message: 'Player is not found'
               }, null);
             } else
               return callback({
                 status: 404,
                 message: 'Team is not found'
               }, null);
           });
       },
       // Step 2
       function notification(callback) {
         callback();
       }
     ],

     function saveAll(err, result) {
       if (err) return next(err);
       else {
         res.json(_match)
       }
     });
 });

 // Invit a user to a Match
 router.patch('/invit/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   var _invitation = {};
   var double = false;

   async.series([
       function pushInvitation(callback) {
         var str = req.body.usersId;
         var usersId = str.split(",").map(function(val) {
           return ObjectId(val);
         });
         Invitation.findOne({
           match: req.params._id
         }).exec(function(err, invitation) {
           if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
           else if (invitation) {
             usersId.forEach(function(user) {
               for (invit of invitation.invited)
               // cant invit yourself + cant invit a user already invited
                 if ((invit.by.equals(req.user._id) && invit.user.equals(user)) || invit.user.equals(req.user._id))
                   double = true;
               if (!double) {
                 invitation.invited.push({
                   by: req.user._id,
                   user: user,
                   date: new Date()
                 });
               }
             });
             invitation.save(function(err, invitation) {
               if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
               _invitation = invitation;
               callback();
             });
           } else {
             var invitation = new Invitation({
               match: req.params._id,
               date: new Date(),
             });
             usersId.forEach(function(user) {
               for (invit of invitation.invited)
                 if ((invit.by.equals(req.user._id) && invit.user.equals(user)) || invit.user.equals(req.user._id))
                   double = true;
               if (!double) {
                 invitation.invited.push({
                   by: req.user._id,
                   user: user,
                   date: new Date()
                 });
               }
             });
             invitation.save(function(err, invitation) {
               if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
               _invitation = invitation;
               callback();
             });
           }
         });
       },
       function pushNotification(callback) {
         callback();
       },
     ], //5626af199ae8c8b68b97dcdd

     function allFinish(err, result) {
       if (err) return next(err);
       res.json(_invitation);
     });
 })

 // Invit a user to a Match
 router.delete('/invit/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   var _invitation = {};
   var double = false;
   var str = req.body.usersId;
   var usersId = str.split(",").map(function(val) {
     return ObjectId(val);
   });

   Invitation.findOneAndUpdate({
     match: req.params._id
   }, {
     "$pull": { // search user in array of invited
       "invited": {
         "by": req.user._id,
         "user": {
           "$in": usersId
         }
       },
     }
   }, {
     "new": true // return doc updated
   }).exec(function(err, invitation) {
     if (err) return callback(err.errors[Object.keys(err.errors)[0]]);
     else if (invitation) {
       res.json(invitation)
     } else {
       return callback({
         status: 404,
         message: 'Invitation is not found'
       }, null);
     }
   });
 });

 module.exports = router;