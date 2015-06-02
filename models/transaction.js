var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var PENDING = 'pending'; // l'empreinte bancaire
var PAYED = 'payed'; // match réalisé
var REFUNDED = 'refunded'; // match annulé

module.exports = mongoose.model('Transaction', {
	creationDate: {type: Date, default: Date.now},
	userId: { type: ObjectId, required: true },
  	payerId: { type: String, required: true },
  	saleId: { type: String, required: true },
  	terrainId : { type: String, required: true },
  	matchId: { type: ObjectId, required: true },
  	devise: { type: String, required: true },
	amount: { type: String, required: true },
  	statut: { type: String, required: true }
});