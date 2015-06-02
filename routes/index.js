var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.query.code){
    console.log('new code : ' + req.query.code);
    res.json({token: req.query.code});
    }
  else res.render('index');
});

module.exports = router;
