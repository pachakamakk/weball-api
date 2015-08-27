var express = require('express');
var router = express.Router();
//var validateToken = require("../middlewares/validateToken");
var isAdmin = require("../middlewares/isAdmin");

/* GET home page. */
router.route('/').get(isAdmin, function(req, res, next) {
  if (req.query.code){
    console.log('new code : ' + req.query.code);
    res.json({token: req.query.code});
    }
  else res.render('index');
});

module.exports = router;
