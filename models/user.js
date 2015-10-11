var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var ObjectId = mongoose.Schema.Types.ObjectId;
var validateEmail = require('../utils/validateEmail');

// UserSchema model
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    match: /^[a-zA-Z0-9-_.]{4,15}$/,
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
    validate: [validateEmail, 'Address email invalid']
  },
  firstName: {
    type: String,
    match: /[a-zA-Z]{2,12}$/,
    required: true
  },
  lastName: {
    type: String,
    match: /[a-zA-Z]{2,12}$/,
    required: true
  },
  birthday: {
    type: Date,
    //  required: false, //After set true 
  },
  location: {
    type: String,
    // required: false,
  },
  role: {
    type: [String],
    //required: false
  },
  photo: {
    type: String,
    // required: false
  },
  friends: {
    type: [ObjectId],
    ref: 'User',
    default: null
  },
  favFields: {
    type: [ObjectId],
    ref: 'Field',
    default: null
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  five: {
    type: ObjectId,
    ref: 'Five'
  },
  matchsId: {
    type: [ObjectId],
    ref: 'Matchs'
  },
  registerDate: {
    type: Date,
    default: Date.now
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
