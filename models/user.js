var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var ObjectId = mongoose.Schema.Types.ObjectId;

var roles = {"ADMIN":0, "USER":1, "FIVE":2};

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};


// UserSchema model
var UserSchema = new mongoose.Schema({
    username: {
    	type : String,
      match: /^[a-zA-Z0-9-_.]{3,15}$/,
    	required : true,
      lowercase:true,
    	index : {unique : true}
    },
    password: {
      type: String,
      required : true
    },
    email:{
    	type : String,
    	required : true,
    	index : {unique : true},
      validate:[validateEmail, 'Veuillez entrer une adresse email valide.']
    },
    firstname: {
      type : String,
      match: /[a-zA-Z]{2,12}$/,
      required : true
    },
    lastname: {
      type : String,
      match: /[a-zA-Z]{2,12}$/,
      required : true
    },
    age : {
      type : Number,
      required : true,
      min : 15,
      max: 100
    },
    location : {
      type : String,
      required : false,
    },
    role: {type: Number, default: roles.USER},
    photoUrl: String,
    creditCardId: String,
    friends : { type: [ObjectId] },
    fav_fields : { type : [ObjectId] },
    has_team : { type: Boolean, default: false},
    teamId : {type : ObjectId},
    points : {type: Number, default: 0, min: 0, max: 100},
    register_date : {type : Date, default : Date.now}
});


// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

// Verify user password in order to authenticate calls to API

UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


module.exports = mongoose.model('User', UserSchema);
module.exports.roles = Object.freeze(roles);
