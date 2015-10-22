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
var Auth = require('../middlewares/Auth');

// Route for Create a Five Company, RIGHTS: adminfive 
router.post('/', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
  if (req.user.roles.indexOf('adminfive') === -1)
    return next({
      status: 403,
      message: 'Only Five Admin'
    }, null);
  if (req.body.fieldsId)
    var fieldsId = req.body.fieldsId.split(",").map(function(val) {
      return ObjectId(val);
    });

  var five = new Five({
    siren: req.body.siren,
    photo: req.body.photo,
    fields: fieldsId,
    name: req.body.name,
    zipCode: req.body.zipCode,
    city: req.body.city,
    country: req.body.country,
    address: req.body.address,
    phone: req.body.phone,
    date: new Date(),
    gps: {
      longitude: req.body.longitude,
      latitude: req.body.latitude
    },
    admins: req.body.admins
  });
  five.save(function(err, field) {
    if (err) next(err);
    else res.json(field);
  });
})


// Get a Five By Id
.get('/:_id', function(req, res, next) {
  Five.findById(req.params._id).populate('fields').exec(function(err, five) {
    if (err)
      next(err);
    else {
      res.json(five);
    }
  });
})

// Get all Five 
.get('/', function(req, res, next) {
  Five.find({})
    .select({
      'date': 0,
      'admins': 0,
      'siren': 0,
      'address': 0
    })
    .exec(function(err, five) {
      if (err) next(err);
      else res.json(five);
    });
})


// Update partial ressource of a Five by Id
.patch('/:_id', Auth.validateAccessAPIAndGetUser, function(req, res, next) {
    if (req.user.roles.indexOf('adminfive') === -1)
    return next({
      status: 403,
      message: 'Only Five Admin'
    }, null);

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

    // avoid double admin
    if (req.body.adminsId) {
      var doubleAdmin = false;
      var adminsId = req.body.adminsId.split(",").map(function(val) {
        return ObjectId(val);
      });
      adminsId.forEach(function(user) {
        for (admin of five.admins) {
        // cant invit a user already invited
          if (admin.equals(user))
            doubleAdmin = true;
        }
        if (!doubleAdmin)
          five.admins.push(user);
      });
    }

    // avoid double field
    if (req.body.fieldsId) {
      var doubleField = false;
      var fieldsId = req.body.fieldsId.split(",").map(function(val) {
        return ObjectId(val);
      });
      fieldsId.forEach(function(_field) {
        for (field of five.fields)
        // cant push a field already invited
          if (field.equals(_field))
            doubleField = true;
        if (!doubleField)
          five.fields.push(_field);
      });
    }

    five.save(function(err, five) {
      if (err) {
        next(err);
      } else res.json(five);
    });
  });
});

module.exports = router;