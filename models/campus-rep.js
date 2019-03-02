const validator = require('validator');
const mongoose = require('mongoose');
const joi = require('joi');


var campusRep = new mongoose.Schema({
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
  dateJoined: Date,
  camp_id: {
    type: String,
    unique: true
  },
  roll: {
    type: String,
    minlength: 1,
    unique: true
    },
    mob_no: {
    type: String,
    required: true,
    minlength: 10,
    unique: true
    },
    w_mob_no: {
    type: String,
    required: true,
    minlength: 10,
    unique: true
    },
    year: {
    type: Number,
    },
    branch_sec : {
      type: String,
      required: true
    },
    exp: {
      type: String
    }
});
mongoose.Promise = global.Promise;

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
      camp_id: joi
      .string()
      .min(5),
      roll: joi.number(),
        mob_no: joi.number().min(10).required(),
        w_mob_no: joi.number().min(10).required(),
        branch_sec: joi.string().max(255).required(),
        exp: joi.string().max(255),
        year: joi.number().min(1)
  };
  return joi.validate(user, schema);
}

var Campusperneur = mongoose.model('campus-rep', campusRep);

module.exports = {
    Campusperneur,
    validate: validateSchema
};
