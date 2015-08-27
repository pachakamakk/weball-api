// Load required packages
var User = require('../models/user');
var express = require('express');
var fs = require('fs');
var router = express.Router();

router.route('/')
// GET current user photo url
.get(function(req, res){
  res.json({'photo' : req.user.photoUrl});
})

// UPDATE user photo
.post(function(req, res, next){
  console.log(__dirname);
  fs.readFile(req.files.image.path, function(err, data){
    var imgName = req.files.image.name;
    console.log(imgName);

    if (!imgName)
      next({status:'403', message:'Bad image file'});
    else {
      res.json({name : __dirname + 'images/' + req.user.username});
    }
  })
})

router.route('/:uname')

// GET photo url from username
.get(function(req, res, next){
  User.find({username:req.params.uname}, function(err, user){
    if (err) next(err);
    else if (!user) next({status:'404', message:'No such user'});
    else res.json(user.photoUrl);
  });
});

module.exports = router;
