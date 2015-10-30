var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var ObjectId = mongoose.Schema.Types.ObjectId;
var validateEmail = require('../utils/validateEmail');

// UserSchema model
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    match: /^[a-zA-Z0-9-_.]{4,16}$/,
    required: true,
    lowercase: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    },
    validate: [validateEmail, 'Veuillez saisir une adresse mail valide']
  },
  firstName: {
    type: String,
    match: /^[a-z A-Z-.]{2,15}$/,
    //  required: true
  },
  lastName: {
    type: String,
    match: /^[a-z A-Z-.]{2,15}$/,
    // required: true
  },
  fullName: {
    type: String,
    match: /^[a-z A-Z-.]{4,20}$/,
    // required: true
  },
  birthday: {
    type: Date,
    //  required: true, //After set true 
  },
  location: {
    type: String,
    match: /^[a-z A-Z.-]{2,20}$/,
    // required: true,
  },
  gps: {
    lng: Number,
    lat: Number
  },
  roles: {
    type: [String]
  },
  photo: {
    type: String,
    match: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,20})([\/\w \.-]*)*\/?$/
      // required: false
  },
  favFields: [{
    type: ObjectId,
    ref: 'Field'
  }],
  points: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  five: [{
    type: ObjectId,
    ref: 'Five'
  }],
  matchs: [{
    type: ObjectId,
    ref: 'Match'
  }],
  date: {
    type: Date,
    required: true
  }
});


// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;
  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err)
      return callback(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err)
        return callback(err);
      else {
        user.password = hash;
        callback();
      }
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
