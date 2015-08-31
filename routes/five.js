/*
 ** Header
 **
 ** Created By Elias CHETOUANI
 ** Created At 29/08/15
 ** Functions For Five Provider 
 */

var express = require('express');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var router = express.Router();
var Five = require('../models/five');

// Route for Create a Five, RIGHT: AdminFive
router.post('/', function(req, res, next) {
  var five = new Five({
    siren: req.body.siren,
    fields: ObjectId(req.body.fieldId),
    name: req.body.name,
    zipCode: req.body.zipCode,
    city: req.body.city,
    country: req.body.country,
    adress: req.body.adress,
    phone: req.body.phone,
    registerDate: req.body.registerDate,
    gps: {
      longitude: req.body.longitude,
      latitude: req.body.latitude
    },
    admins: ObjectId(req.body.admins)
  });
  five.save(function(err, field) {
    if (err) {
      console.log(err);
      next(err);
    } else res.json(field);
  })
})

// Get a Five By Id
.get('/:_id', function(req, res, next) {
  Five.findById(req.params._id).exec(function(err, five) {
    if (err)
      next(err);
    else {
      res.json(five);
    }
  });
})


// 
.patch('/:_id', function(req, res, next) {

  var exist = false;
  Five.findById(req.params._id).exec(function(err, five) {
    five.siren = req.body.siren;
    five.name = req.body.name;
    five.zipCode = req.body.zipCode;
    five.city = req.body.city;
    five.country = req.body.country;
    five.adress = req.body.adress;
    five.phone = req.body.phone;
    five.registerDate = req.body.registerDate;
    five.gps = {
      longitude: req.body.longitude,
      latitude: req.body.latitude
    };

    // Test if variable exist pour empecher de push un null, puis check tab pour éviter les doublons
    if (req.body.admins) {
      five.admins.forEach(function(admin) {
        if (admin == req.body.admins)
          exist = true;
      })
      if (!exist)
        five.admins.push(ObjectId(req.body.admins));
    }
    if (req.body.fieldId) {
      exist = false;
      five.fields.forEach(function(field) {
        if (field == req.body.fieldId)
          exist = true;
      })
      if (!exist)
        five.fields.push(ObjectId(req.body.fieldId));
    }
    five.save(function(err, five) {
      if (err) {
        next(err);
      } else res.json(five);
    })
  })
})

module.exports = router;