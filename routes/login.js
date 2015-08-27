var express = require('express');
var router = express.Router();
var controller = require('../utils/login');

router.post('/', controller.login, function(req, res, next) {
  res.json(req.token);
});

module.exports = router;