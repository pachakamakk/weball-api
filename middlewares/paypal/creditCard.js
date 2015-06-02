var paypal = require('paypal-rest-sdk');
var User = require('../../models/user');

// Dev
var card_data = {
  "type": "visa",
 // "payer_id" : "A RECUPERER A LAUTHENTIFICATION",
  "number": "4417119669820331",
  "expire_month": "11",
  "expire_year": "2018",
  "cvv2": "123",
  "first_name": "Joe",
  "last_name": "Shopper"
};

var creditCard = { 

// Create a CC In Paypal DB + Card ID in User DB
create: function(req, res, next) { 
  var req_card_data = {
  type : req.type,
  number : req.number,
  payer_id : req.payer_id,
  expire_month : req.expire_month,
  expire_year : req.expire_year,
  cvv2 : req.cvv2,
  first_name : req.first_name,
  last_name : req.last_name
}

// Put CC In PayPal API
paypal.creditCard.create(card_data, function(error, credit_card) {
  if (error) {
    console.log(error);
   return (next(error));} 
  
  // Put CreditCard ID in DB User
    else {
      putCardIdByUserId(req.user._id, credit_card.id, next);
      console.log("CreditCard Add By " + req.user.username);
      next();
    }})
},

// Del CC In PayPal API
delete: function(req, res, next) { 
 paypal.creditCard.del(req.user.creditCardId, function (error, no_response) {
    if (error) {
    console.log(error);
    return (next(error));}
    // Del CreditCard ID in DB User
    else {
      delCardIdByUserId(req.user._id, next);
      console.log("CreditCard Deleted By " + req.user.username);
      next();}
      });
},

// Get CC PayPal API
get: function(req, res, next) { 
paypal.creditCard.get(req.user.creditCardId, function (error, credit_card) {
    if (error) {
    console.log(error);
    return (next(error));} 

    // Del CreditCard ID, links, https status for the response
    else {
      console.log("Retrieve Credit Card Response By " + req.user.username);
      delete credit_card.id;
      delete credit_card.links;
      delete credit_card.httpStatusCode;
      req.credit_card = credit_card;
      next();
    }});
}

}

// private methode

// Put Card ID On The DB User
function putCardIdByUserId(userId, cardId, next) {
  User.findByIdAndUpdate(userId, {$set:{ creditCardId : cardId}}, function(err, user) {
  if (err) return next(err);
      });
};

// Delete Card ID Of The DB User
function delCardIdByUserId(userId, next) {
  User.findByIdAndUpdate(userId, {$set:{ creditCardId : undefined}}, function(err, user) {
  if (err) return next(err);
      });
};


module.exports = creditCard;