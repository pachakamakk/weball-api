// Load required packages
var Client = require('../models/client');
var express = require('express');
var authController = require('../middlewares/auth')
var router = express.Router();

// Create endpoint /api/client for POST
router.route('/')
.post(authController.isAuthenticated, function(req, res, next) {
  // Create a new instance of the Client model
  var client = new Client();

  // Set the client properties that came from the POST data
  client.name = req.body.name;
  client.id = req.body.id;
  client.secret = req.body.secret;
  client.userId = req.user._id;

  // Save the client and check for errors
  client.save(function(err) {
    if (err)
      next(err);
    else
      res.send(200);
  });
})

// Create endpoint /api/clients for GET
.get(authController.isAuthenticated, function(req, res, next) {
  // Use the Client model to find all clients
  Client.find({ userId: req.user._id }, function(err, clients) {
    if (err)
      next(err);
    else
      res.json(clients);
  });
});

module.exports = router;
