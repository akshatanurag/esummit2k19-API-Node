const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: vaule => {
        return validator.isEmail(vaule);
      },
      message: '{value} is not a email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  dateJoined: Date,
  resetPasswordToken: String,
  resetEmailToken: String,
  resetEmailExpires: Date,
  //resetPasswordExpires: Date,
  secureSessionID: String,
  isEmailVerified: {
    default: 1,
    type: Number
  },
  payments: {
    isPaid: {
      type: Boolean,
      default: false
    },
    payment_id: {
      type: String
    },
    instamojo_id: {
      type: String
    }
  },
  singUpType: {
    type: String,
    required: true
  }
});
mongoose.Promise = global.Promise;
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password, hashPass) {
  return bcrypt.compareSync(password, hashPass);
};

userSchema.methods.generateAuthToken = function(bodyEmail) {
  return jwt.sign(
    {
      email: bodyEmail
    },
    config.get('jwtPrivateKey')
  );
};

function validateSchema(user) {
  const schema = {
    name: joi
      .string()
      .min(1)
      .max(50)
      .required(),
    email: joi
      .string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: joi
      .string()
      .min(5)
      .max(255)
      .required()
  };
  return joi.validate(user, schema);
}

var User = mongoose.model('user', userSchema);

module.exports = {
  User,
  validate: validateSchema
};
