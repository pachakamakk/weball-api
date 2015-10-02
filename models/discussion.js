// Chat schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Discussion', {
	members: {
		type:	[String],
		default: null
	},
	messages: {
		type:	[String],
		default: null
	},
	creation_date: {
		type: Date,
		default: Date.now
	}
});