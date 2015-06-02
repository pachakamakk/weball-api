var express = require('express');
var router = express.Router();
var isAuth = require('../middlewares/validateToken');


router.route('/')

.get(isAuth, function(req, res, next) {
  res.send(200);
});

module.exports = router;
