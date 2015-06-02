var paypal = require('paypal-rest-sdk');
var User = require('../../models/user');
var Team = require('../../models/team');
var Terrain = require('../../models/terrain');
var Transaction = require('../../models/transaction');

var payment = { 

// Create a Payment with a Saved Credit Card
createWithSavedCc: function(req, res, next) { 
var savedCard = {
    "intent": "sale",
    "payer": {
        "payment_method": "credit_card",
        "funding_instruments": [{
            "credit_card_token": {
             	"credit_card_id": req.user.creditCardId
            }
        }]
    },
    "transactions": [{
        "amount": {
            "currency": "EUR",
            "total": "1.00"
        },
        "description": "Paiement à weBall SAS."
    }]
};

var matchId = 'ID DU MATCH';
var amount = '1.00';
//TerrainId ?

// get amount du terrain et per person
/*
Terrain.findByOne(req.terrainId, function(err, terrain) {
 	if (err) return next(err);
	else
		var amount = terrain.price;
		var devise = terrain.devise;
});

// Créer une transaction 
	var saleId = transaction.saleId;
 	var data = {
    "amount": {
        "currency": transaction.device,
        "total": transaction.amount
    }
};

*/
paypal.payment.create(savedCard, function (error, payment) {
    if (error) {return (next(error));}
    else {
        console.log("Pay with stored card Response");
    	req.payment = payment;
    	console.log(payment);

		next();
}});
},

// Execute a Payment with PayPal - payer_id
executeWithPaypal: function(req, res, next) { 
var create_payment_json = {
    "intent": "authorize",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "https://localhost:8181/",
        "cancel_url": "https://localhost:8181/"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "item",
                "price": "1.00",
                "currency": "EUR",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "EUR",
            "total": "1.00"
        },
        "description": "Paiement à weBall SAS."
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {console.log(error.response); return (next(error));}
    else {
        for (var index = 0; index < payment.links.length; index++) {
        //Redirect user to this endpoint for redirect url
            if (payment.links[index].rel === 'approval_url') {
                console.log(payment.links[index].href);
            }
        }
   //     console.log(payment);
          console.log('CREATE OK');
  
    }
});

var execute_payment_json = {
    "payer_id": "Appended to redirect url",
    "transactions": [{
        "amount": {
            "currency": "EUR",
            "total": "1.00"
        }
    }]
};

// Execute Payment with paymentID généré juste avant + payer_id à récuperer
paypal.payment.execute(payment.id, execute_payment_json, function (error, payment) {
     if (error) {console.log(error.response); return (next(error));}
     else {
        console.log("Get Payment Response");
       // console.log(JSON.stringify(payment));
        req.payment = JSON.stringify(payment);
        next();
    }
});
},

// Refund a Payment with 
refund: function(req, res, next) { 
Transaction.findByOneAndUpdate(req.matchId, {$set:{ statut : 'refund'}}, function(err, user) {
  if (err) return next(err);

 	var saleId = Transaction.saleId;
 	var data = {
    "amount": {
        "currency": Transaction.device,
        "total": Transaction.amount
    }
}

      });
// Find the corresponding match
Match.findByIdAndUpdate(req.matchId, {$set:{ statut : 'refund'}}, function(err, user) {
  if (err) return next(err);


      });

//saleId = "3RM92092UW5126232";

paypal.sale.refund(saleId, data, function (error, refund) {
    if (error) {return (next(error));}
    else {
        console.log("Refund Sale Response");
        console.log(JSON.stringify(refund));
    }

});
}


}

// se connecter avec paypal et recuperer toutes les infos

module.exports = payment