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
  var ONE_HOUR = 1000 * 60 * 60;
  // Calcul the duration of the slot
  var duration = Math.abs((new Date(req.body.calendarEnd_date)).getTime() - (new Date(req.body.calendarStart_date)).getTime())
  duration = (duration / ONE_HOUR);
  var field = new Field({
    available: req.body.available,
    name: req.body.name,
    fiveId: req.body.fiveId
  });
  // Detect if is a slot 1h or 0:30 ONLY
  if (req.body.calendarStart_date && req.body.calendarEnd_date && (duration == 1 || duration == 0.5)) {
    field.calendar.push({
      available: req.body.calendarAvailable,
      status: req.body.calendarStatus,
      amount: req.body.calendarAmount,
      matchId: req.body.calendarMatchId,
      start_date: req.body.calendarStart_date,
      end_date: req.body.calendarEnd_date
    });
  }
  field.save(function(err, field) {
    if (err) {
      next(err);
    } else res.json(field);
  })
})

// Update field (to add a slot)
.patch('/:_id', function(req, res, next) {
  var _slotFound = false;
  var _slotAlreadyBook = false;
  var ONE_HOUR = 1000 * 60 * 60;
  var duration = Math.abs((new Date(req.body.calendarEnd_date)).getTime() - (new Date(req.body.calendarStart_date)).getTime())
  duration = (duration / ONE_HOUR);
  if (duration == 1 || duration == 0.5) {
    Field.findById(req.params._id).exec(function(err, field) {
      if (err)
        return next(err);
      else if (field) {
        field.available = req.body.available;
        field.name = req.body.name;
        field.five = req.body.fiveId;
        field.calendar.forEach(function(calendar) {
          if ((calendar.start_date == req.body.calendarStart_date) &&
            (calendar.end_date == req.body.calendarEnd_date)) {
            _slotFound = true;
            console.log("Crenau trouvé: mise à jour.");
            calendar.available = req.body.calendarAvailable;
            calendar.status = req.body.calendarStatus;
            calendar.matchId = req.body.matchId;
            calendar.amount = req.body.calendarAmount;
            calendar.start_date = req.body.newStart_date;
            calendar.end_date = req.body.newEnd_date;
          }
        });
        field.calendar.forEach(function(calendar) {
          if (((new Date(req.body.calendarStart_date) >= new Date(calendar.start_date)) &&
              (new Date(req.body.calendarStart_date) < new Date(calendar.end_date))) ||
            ((new Date(req.body.calendarEnd_date) > new Date(calendar.start_date)) &&
              (new Date(req.body.calendarEnd_date) < new Date(calendar.end_date)))
          ) {
            console.log("Error: Le créneau est compris entre un slot");
            _slotAlreadyBook = true;
          }
        })
        if (_slotFound == false && _slotAlreadyBook == false && req.body.calendarStart_date &&
          req.body.calendarEnd_date) {
          console.log("Crenau non-trouvé: création sans chevauche.");
          field.available = req.body.available;
          field.name = req.body.name;
          field.calendar.push({
            status: req.body.calendarStatus,
            amount: req.body.calendarAmount,
            matchId: req.body.matchId,
            start_date: new Date(req.body.calendarStart_date),
            end_date: new Date(req.body.calendarEnd_date)
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
        next({
          status: 404,
          message: 'No such field'
        });
      }
    });
  } else
    next({
      status: 400,
      message: 'Slot Date: 1hour or 30min'
    });

})

// List fields by Five Id
.get('/:_id', function(req, res, next) {
  Field.find({
    five: req.params._id
  }).exec(function(err, fields) {
    if (err) return next(err);
    else res.json(fields);
  });
});

// A refaire
// router.route('/:id')
//   .get(function(req, res, next) {
//     Field.findById(req.params.id, function(err, field) {
//       if (err) return next(err);
//       else res.json(field);
//     });
//   })
//   .delete(isFive, function(req, res, next) {
//     Field.remove({
//       _id: req.five._id
//     }, function(err, five) {
//       if (err)
//         next(err);
//       else
//         res.sendStatus(200);
//     });
//   });

module.exports = router;