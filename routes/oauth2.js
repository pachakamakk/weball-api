var express = require('express');
var router = express.Router();
var User = require('../models/user');


var authController = require('../middlewares/auth');
var oauth2Controller = require('../middlewares/oauth2');

router.route('/authorize')
.get(authController.isAuthenticated, oauth2Controller.authorization)
.post(authController.isAuthenticated, oauth2Controller.decision);

router.route('/token')
.post(authController.isClientAuthenticated, oauth2Controller.token)

module.exports = router