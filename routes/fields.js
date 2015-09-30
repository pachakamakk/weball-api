var express = require('express');
var router = express.Router();
var Field = require('../models/field');


/**
 ** GET List fields
 ** GET:name get field from his name
 ** POST ajouter field
 ** DELETE supprimer field
 **/
// List fields by Five Id
router.get('/five/:_id', function(req, res, next) {
  Field.find({
    fiveId: req.params._id
  }).exec(function(err, fields) {
    if (err) return next(err);
    else res.json(fields);
  });
})

.get('/:_id', function(req, res, next) {
  Field.findById(req.params._id).exec(function(err, field) {
    if (err) return next(err);
    else res.json(field);
  });
})

// '/'
.post('/', function(req, res, next) {
  // Calcul the duration of the slot
  var field = new Field({
    available: req.body.available,
    name: req.body.name,
    fiveId: req.body.fiveId,
    picture: req.body.picture,
    pricesPerHour: {
      0: {
        9: 10,
        12: -1,
        14: 15,
        23: -1
      },
      1: {
        9: 10,
        23: -1
      },
      2: {
        9: 10,
        23: -1
      },
      3: {
        9: 10,
        23: -1
      },
      4: {
        9: 10,
        23: -1
      },
      5: {
        9: 10,
        23: -1
      },
      6: {
        9: 10,
        23: -1
      }
    },
    pricesPerHalf: {
      0: {
        9: 5,
        12: -1,
        14: 10,
        23: -1
      },
      1: {
        9: 10,
        23: -1
      },
      2: {
        9: 10,
        23: -1
      },
      3: {
        9: 10,
        23: -1
      },
      4: {
        9: 10,
        23: -1
      },
      5: {
        9: 10,
        23: -1
      },
      6: {
        9: 10,
        23: -1
      }
    }
  });
  field.save(function(err, field) {
    if (err) {
      next(err);
    } else res.json(field);
  });
})

// Update field (to add a slot)
.patch('/:_id', function(req, res, next) {
  Field.findById(req.params._id).exec(function(err, field) {
    if (err)
      return next(err);
    else if (field) {
      field.available = req.body.available;
      field.name = req.body.name;
      field.five = req.body.fiveId;
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
})

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
