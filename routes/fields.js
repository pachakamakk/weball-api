var express = require('express');
var router = express.Router();
var Field = require('../models/field');
var validateToken = require('../middlewares/validateToken');
var isFive = require('../middlewares/isFive');


/**
 ** GET List fields
 ** GET:name get field from his name
 ** POST ajouter field
 ** DELETE supprimer field
 **/

router.route('/')
  // Add field
  .post(validateToken, isFive, function(req, res, next) {
    var field = new Field({
      name: req.body.name,
      price: req.body.price,
      five: req.five._id
    });

    field.save(function(err) {
      if (err) next(err);
      else res.sendStatus(200);
    })
  })

// List fields
.get(validateToken, function(req, res, next) {
  Field.find(function(err, fields) {
    if (err) next(err);
    else res.json(fields);
  });
});


router.route('/:id')
  .get(validateToken, function(req, res, next) {
    Field.findById(req.params.id, function(err, field) {
      if (err) next(err);
      else res.json(field);
    });
  })
  .delete(validateToken, isFive, function(req, res, next) {
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