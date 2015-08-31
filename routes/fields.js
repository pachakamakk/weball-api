var express = require('express');
var router = express.Router();
var Field = require('../models/field');
var isFive = require('../middlewares/isFive');

/**
 ** GET List fields
 ** GET:name get field from his name
 ** POST ajouter field
 ** DELETE supprimer field
 **/

router.post('/', function(req, res, next) {
  var field = new Field({
    available: req.body.available,
    name: req.body.name,
    five: req.body.fiveId
  });
  field.calendar.push({
    available: req.body.calendarAvailable,
    status: req.body.calendarStatus,
    amount: req.body.calendarAmount,
    matchId: req.body.matchId,
    date: req.body.calendarDate
  });
  field.save(function(err, field) {
    if (err) {
      next(err);
    } else res.json(field);
  })
})

// Update field (to add a slot)
.patch('/:_id', function(req, res, next) {
  var _slotFound = false;

  Field.findById(req.params._id).exec(function(err, field) {
    if (err)
      return next(err);
    else if (field) {
      field.available = req.body.available;
      field.name = req.body.name;
      field.five = req.body.fiveId;
      field.calendar.forEach(function(calendar) {
        if (calendar.date == req.body.calendarDate) {
          _slotFound = true;
          console.log("Crenau trouvé: mise à jour.");
          calendar.available = req.body.calendarAvailable;
          calendar.status = req.body.calendarStatus;
          calendar.matchId = req.body.matchId;
          calendar.amount = req.body.calendarAmount;
        }
      });
      if (_slotFound == false) {
        if (!req.body.calendarDate) {
          return next({
            status: 400,
            message: 'calendar date is empty'
          });
        }
        console.log("Crenau non-trouvé: création.");
        field.available = req.body.available;
        field.name = req.body.name;
        field.calendar.push({
          available: req.body.calendarAvailable,
          status: req.body.calendarStatus,
          amount: req.body.calendarAmount,
          matchId: req.body.matchId,
          date: req.body.calendarDate
        });
      }
      field.save(function(err, saved) {
        if (err) {
          return next(err);
        } else {
          res.json(saved);
        }
      });
    } else {
      next("No such field");
    }
  });
})

// List fields by Five Id
.get('/:_id', function(req, res, next) {
  Field.find({five: req.params._id}).exec(function(err, fields) {
    if (err) return next(err);
    else res.json(fields);
  });
});

// A refaire
router.route('/:id')
  .get(function(req, res, next) {
    Field.findById(req.params.id, function(err, field) {
      if (err) return next(err);
      else res.json(field);
    });
  })
  .delete(isFive, function(req, res, next) {
    Field.remove({
      _id: req.five._id
    }, function(err, five) {
      if (err)
        next(err);
      else
        res.sendStatus(200);
    });
  });

module.exports = router;