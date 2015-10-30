var express = require('express');
var router = express.Router();
var controller = require('../utils/logout');
var Auth = require('../middlewares/Auth');


router.delete('/', Auth.validateAccessAPIbyToken, controller.logout, function(req, res, next) {
  res.json({
    message: "Disconnected"
  });
});

module.exports = router;