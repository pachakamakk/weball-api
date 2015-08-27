var express = require('express');
var router = express.Router();
var User = require('../models/user');
var validateToken = require('../middlewares/validateToken');

// GET list users, POST save user
router.route('/')
  // List users
  .get(validateToken, function(req, res, next) {
    var query = User.find({}).select(
      'username email firstname age lastname registerDate hasTeam favFields points friends'
    );
    query.exec(function(err, users) {
      if (err) next(err);
      else res.json(users);
    });
  })

// Register user
.post(function(req, res, next) {
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    firstname: req.body.firstname,
    age: req.body.age,
    lastname: req.body.lastname
  });

  user.save(function(err) {
    if (err)
      next(err);
    else
      res.sendStatus(200);
  });
})

// Register user
.patch(function(req, res, next) {
  console.log("message");
  res.json("ok")

});

router.route('/:id')
  //Get user from his username
  .get(validateToken, function(req, res, next) {
    var query = User.findById(req.params.id).select(
      'username email firstname age lastname registerDate hasTeam favFields points friends'
    );
    query.exec(function(err, user) {
      //Error
      if (err) next(err);
      //No user found
      else if (!user) next({
        status: 404,
        error: 'No such user'
      });
      //Success
      else res.json(user);
    });
  });

module.exports = router;