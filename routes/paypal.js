var express = require('express');
var router = express.Router();
var validateToken = require('../middlewares/validateToken');
var paypal = require('paypal-rest-sdk');
var creditCard = require('../middlewares/paypal/creditCard');
var payment = require('../middlewares/paypal/payment');
var auth = require('../middlewares/paypal/openIdConnect');

// OpenID Connect 
router.route('/openidconnect')
.post(validateToken, auth.connect, function(req, res, next) {
	res.send(200);
});


// Add CreditCard By Token
router.route('/credit-card/create')
.post(validateToken, creditCard.create, function(req, res, next) {
	res.json({status: '200', message: 'Created'});
});
// Get CreditCard By Token
router.route('/credit-card/get')
.post(validateToken, creditCard.get, function(req, res, next) {
	res.json(req.credit_card);
});
// Del CreditCard By Token
router.route('/credit-card/delete')
.delete(validateToken, creditCard.delete, function(req, res, next) {
	res.json({status: '200', message: 'Deleted'});
});


// Create Payment By Credit Card Saved
router.route('/payment/create-cc-saved')
.post(validateToken, payment.createWithSavedCc, function(req, res, next) {
	res.json(req.payment);
});
// Execute Payment With PayPal Account
router.route('/payment/execute')
.post(validateToken, payment.executeWithPaypal, function(req, res, next) {
	res.json(req.payment);
});
// Refund a Payment with ?
router.route('/payment/refund')
.post(validateToken, payment.refund, function(req, res, next) {
	res.json(req.refund);
});

module.exports=function(paypal) {
  return (router);
};