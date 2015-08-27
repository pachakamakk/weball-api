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
  console.log(req.body);
  var field = new Field({
    available: req.body.available,
    name: req.body.name,
    calendar: req.body.calendar,
    five: req.body._id
  });
  field.save(function(err, field) {
    if (err) {
      console.log(err);
      next(err);
    } else res.json(field);
  })
})

// List fields by Id?
.get('/', function(req, res, next) {
  console.log("message");
  Field.find(function(err, fields) {
    if (err) next(err);
    else res.json(fields);
  });
});


router.route('/:id')
  .get(function(req, res, next) {
    Field.findById(req.params.id, function(err, field) {
      if (err) next(err);
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