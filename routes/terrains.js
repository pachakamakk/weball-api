var express = require('express');
var router = express.Router();
var Terrain = require('../models/terrain');
var isAuth = require('../middlewares/validateToken');


/**
 ** GET List terrains
 ** GET:name get terrain from his name
 ** POST ajouter terrain
 ** DELETE supprimer terrain
**/

router.route('/')
// Add terrain
.post(isAuth, function(req, res, next){
  var terrain = new Terrain({
    name : req.body.name,
    postalCode : req.body.postal_code,
    city : req.body.city,
    county : req.body.county,
    adress : req.body.adress,
    schedule : req.body.schedule,
    price : req.body.price,
    phone : req.body.phone,
    gps : req.body.gps,
    userId : req.user._id
  });

  terrain.save(function(err){
    if (err) next(err);
    else res.send(200);
  })
})

// List terrains
.get(isAuth, function(req, res, next){
  Terrain.find(function(err, terrains){
    if (err) next(err);
    else res.json(terrains);
  });
});

router.route('/:name')
// Find terrain from his name
.get(isAuth, function(req, res, next){
  Terrain.find({name:req.params.name}, function(err, terrain){
    if (err) next(err);
    else res.json(terrain);
  });
});

module.exports = router;
