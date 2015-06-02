var express = require('express');
var router = express.Router();
var loginController = require('../middlewares/login');

router.route('/')

.post(loginController.login, function(req, res, next) {
		res.json(req.token);
});


module.exports = router;
