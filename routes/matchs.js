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

   Match.find(req.user.matchs).populate('teamsId').sort(req.query.sort).where('status', req.query.status).exec(function(err, matchs) {
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

 // Get 1 match by Id
 router.get('/:_id', Auth.validateAccessAPIbyToken, function(req, res, next) {
   Match.findById(req.params._id).populate('teamsId').exec(function(err, match) {
     if (err) next(err);
     else res.json(match);
   });
 });

 // Create a new Match By Field and Join
 router.post('/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   var matchCreated = {};
   var amount = 0;
   var _fiveId;
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
         Field.findById(req.body.fieldId).exec(function(err, field) {
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
             if (amount > 0) {
               _fiveId = field.five;
               callback();
             } else {
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
             // if error new match delete team
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
                   five: _fiveId,
                   amount: amount,
                   created_at: new Date(),
                   created_by: req.user._id,
                   currentPlayers: 1,
                   teamsId: team._id
                 });
                 match.teamsId.push(teamB._id);
                 match.save(function(err, match) {
                   if (err) {
                     team.remove();
                     teamB.remove();
                     return callback(err.errors[Object.keys(err.errors)[0]]);
                   } else {
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
           users: req.user._id
         });
         chat.save(function(err, chat) {
           if (err) {
             matchCreated.remove();
             return next(err); // faire: annuler les fonctions en haut
           } else {
             matchCreated.chatId = chat._id;
             matchCreated.save(function(err) {
               if (err) {
                 return callback(err);
               } else {
                 callback();
               }
             });
           }
         });
       },
       //Step 4
       function StoreMatchInUser(callback) {
         req.user.matchs.push(matchCreated._id);
         req.user.save(function(err, match) {
           if (err) return callback(err); // annuler toute les autres fonctions
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
   var _team = {};

   async.series([
       // Step 1
       function matchIsAvailableToJoin(callback) {
         Match.findById(req.params._id).populate('teamsId').exec(function(err, match) {
           if (err) return callback(err);
           if (match) {

             for (team of match.teamsId) {
               var index = team.playersId.indexOf(req.user._id)
               if (index > -1) {
                 return callback({
                   status: 405,
                   message: 'You are already registred in this team: ' + team._id
                 }, null);
               }
             }
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
           $or: [{
             "start_date": {
               "$gte": _match.start_date,
               "$lt": _match.end_date
             }
           }, {
             "end_date": {
               "$gt": _match.start_date,
               "$lte": _match.end_date
             }
           }]
         }).exec(function(err, match) {
           if (err) return callback(err);
           else if (match) {
             return callback({
               status: 405,
               message: 'You participate an match at same date: ' + match._id.toString()
             }, null);
           } else
             callback();
         });
       },

       // Step 2
       function joinTeam(callback) {
         for (team of _match.teamsId) {
           if (team._id.equals(req.body.teamId)) {
             team.playersId.push(req.user._id);
             _team = team;
             return callback();
           }
         }
         return callback({
           status: 405,
           message: 'Team id wrong'
         }, null);
       }
     ],

     function saveAll(err, result) {
       if (err) return next(err);
       else {
         _team.save(function(err, team) {
           if (err) return next(err);
           _match.save(function(err, match) {
             if (err) return next(err);
             req.user.matchs.push(match._id)
             req.user.save(function(err, user) {
               if (err) return next(err.errors);
               res.json(team);
             })
           });
         });
       }
     });
 });

 // Update Partial Ressource of a match
 router.patch('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   var amount = 0;
   var _match = {};
   var matchsId = [];
   var _users = []

   // If Date exist and correct: Need 1h or 30min.
   if (req.body.start_date && req.body.end_date) {
     var ONE_HOUR = 1000 * 60 * 60;
     var duration = (new Date(req.body.end_date)).getTime() - (new Date(req.body.start_date)).getTime()
     duration = (duration / ONE_HOUR);
     if (duration != 1 && duration != 0.5)
       return next({
         status: 449,
         message: 'Invalid date: 1h or 30min'
       }, null);
   }

   async.series([
       function getMatchAndValidations(callback) {
         Match.findById(req.params._id).populate('teamsId').exec(function(err, match) {
           if (err) return callback(err);
           else if (match) {
             _match = match;
             // maxPlayer need: PAIR
             var now = new Date();
             if ((match.start_date - now) < (1000 * 60 * 60 * 48))
               return next({
                 status: 405,
                 message: "Vous ne pouvez modifier un match 48h avant"
               }, null);
             if (req.body.maxPlayers && (req.body.maxPlayers && (req.body.maxPlayers % 2) != 0))
               return callback({
                 status: 449,
                 message: 'Invalid maxPlayers: Need PAIR Number'
               }, null);
             if (req.body.maxPlayers && (req.body.maxPlayers < _match.currentPlayers))
               return callback({
                 status: 449,
                 message: 'maxPlayers < currentPlayers'
               }, null);
             callback();
           } else
             return callback({
               status: 404,
               message: 'Match not found'
             }, null);
         });
       },

       // Get Ids of matchs for check if users arent registred in others matchs at the same date
       function getMatchsIdFromUser(callback) {
         var usersId = _match.teamsId[0].playersId.concat(_match.teamsId[1].playersId)
         User.find(usersId).select('matchs').exec(function(err, users) {
           if (err) return callback(err);
           else if (users) {
             _users = users;
             users.forEach(function(user) {
               var ids = user.matchs.filter(function(val) {
                 if (!val.equals(_match._id))
                   return val;
               });
               matchsId = matchsId.concat(ids);
             });
             callback();
           } else
             return callback({
               status: 404,
               message: 'Users not found'
             }, null);
         });
       },

       // Step: anti overlap booking others Users
       function overLapBooking(callback) {
         Match.findOne({
           _id: {
             '$in': matchsId
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
           if (err) return callback(err);
           else if (match) {
             for (user of _users) {
               for (userMatch of user.matchs) {
                 if (userMatch.equals(match._id))
                   return callback({
                     status: 405,
                     message: 'This user: ' + user._id.toString() + ' is registred in this match: ' + match._id.toString() + 'at the same date'
                   }, null);
               }
             }
           } else {
             callback();
           }
         });
       },

       // Step: 4
       function getAmountByDate(callback) {
         if (req.body.fieldId && req.body.start_date && req.body.end_date) {
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
               if (amount > 0) {
                 _match.amount = amount;
                 _match.fieldId = req.body.fieldId;
                 callback();
               } else {
                 var err = new Error('This five is closed at this date');
                 err.status = 449;
                 return callback(err);
               }
             } else {
               var err = new Error('No such Field');
               err.status = 401;
               return callback(err);
             }
           });
         }
         callback();
       },

       // Step 2
       function newSlotIsAlreadyBooked(callback) {
         if (req.body.fieldId && req.body.start_date && req.body.end_date) {
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
             if (err) return callback(err);
             else if (match) {
               return callback({
                 status: 449,
                 message: 'Slot is already booked: ' + match._id
               }, null);
             } else {
               _match.start_date = req.body.start_date;
               _match.end_date = req.body.end_date;
               callback();
             }
           });
         } else
           callback();
       },

       // Step 3
       function saveMatch(callback) {
         _match.name = req.body.name || _match.name;
         _match.maxPlayers = req.body.maxPlayers || _match.maxPlayers;
         _match.private = req.body.private || _match.private;
         _match.save(function(err, match) {
           if (err) next(err.errors[Object.keys(err.errors)[0]]);
           else
             callback();
         });
       }
     ],
     function(err, result) {
       if (err) // if a function series fail 
         return next(err);
       else
         res.json(_match);
     });
 });


 // Leave Match 
 router.patch('/leave/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   var _match = {};

   async.series([
       // Step 1
       function removeUser(callback) {
         Match.findById(req.params._id)
           .populate('teamsId').exec(function(err, match) {
             if (err) callback(err);
             else if (match) {
               var now = new Date();
               if ((match.start_date - now) < (1000 * 60 * 60 * 48))
                 return callback({
                   status: 405,
                   message: 'Leave a match before: 48h'
                 }, null);
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
                 if (index > -1) { // delete my userId of the team, decrement currentPlayer, save my matchsId 
                   team.playersId.splice(index, 1);
                   team.save(function(err, teamS) {
                     if (err) return callback(err);
                     match.currentPlayers = match.currentPlayers - 1;
                     match.save(function(err, match) {
                       if (err) return callback(err);
                       _match = match;
                       req.user.matchs.pull(_match._id)
                       req.user.save(function(err, user) {
                         if (err) return callback(err);
                         callback();
                       });
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
                 message: 'Match is not found'
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

 // Cancel Match 
 router.delete('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
   var _match = {};
   var usersId = [];

   async.series([

       // Step 1: Switch status to: cancel
       function removeMatch(callback) {
         Match.findById(req.params._id).populate('teamsId').exec(function(err, match) {
           if (err) return callback(err);
           else if (match) {
             var now = new Date();
             if ((match.start_date - now) < (1000 * 60 * 60 * 48))
               return next({
                 status: 405,
                 message: "Vous ne pouvez annuler un match 48h avant"
               }, null);
             _match = match;
             _match.remove(function(err, match) {
               if (err) return callback(err);
               callback();
             });
           } else
             return callback({
               status: 404,
               message: 'Match is not found'
             }, null);

         });
       },

       // Step 2:
       function removeIDFromUsers(callback) {
         if (_match.teamsId[0] && _match.teamsId[1])
           usersId = _match.teamsId[0].playersId.concat(_match.teamsId[1].playersId)
         User.update({
           _id: {
             $in: usersId
           }
         }, {
           $pull: {
             matchs: _match._id
           }
         }, {
           multi: true
         }).exec(function(err) {
           if (err) return callback(err);
           callback();
         });
       },

       // Step 3:
       function removeInvitations(callback) {
         Invitation.remove({
           match: _match._id
         }, function(err) {
           if (err) return callback(err);
           callback();
         });

       },

       // Step 4:
       function removeTeams(callback) {
         if (_match.teamsId[0] && _match.teamsId[1]) {
           var teamsId = [];
           teamsId.push(_match.teamsId[0]._id)
           teamsId.push(_match.teamsId[1]._id)
         }
         Team.remove({
           _id: {
             $in: teamsId
           }
         }, function(err) {
           if (err) return callback(err);
           callback();
         });
       },

       // Step 5: Inform users of match cancelling
       function sendNotifications(callback) {
         callback();
       }
     ],

     function saveAll(err, result) {
       if (err) return next(err);
       else {
         res.json(_match);
       }
     });
 });

 module.exports = router;
