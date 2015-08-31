var express = require('express');
var router = express.Router();
var isAdmin = require("../middlewares/isAdmin");

/* GET home page. */
router.route('/').get(function(req, res, next) {
  res.render('index');
});

module.exports = router;