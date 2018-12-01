const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs')
const joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const adminSchema =  new mongoose.Schema({
    email: {
        type: String,
        minlength: 5,
        required: true
    },
    password: {
        type: String,
        minlength: 6,
        required: true
    }
})

// userSchema.methods.generateHash = function (password) {
//     console.log(bcrypt.hashSync(password, bcrypt.genSaltSync(10), null))
// };

// // checking if password is valid
// userSchema.methods.validPassword = function (password, hashPass) {
//     return bcrypt.compareSync(password, hashPass);
// };

adminSchema.methods.generateAuthToken = function (bodyEmail) {
    return jwt.sign({
        isAdmin: true,
        email: bodyEmail
    }, config.get("jwtPrivateKey"))
}

function validateSchema(admins) {
    const schema = {
        //name: joi.string().min(1).max(50).required(),
        email: joi.string().min(5).max(255).required().email(),
        password: joi.string().min(5).max(255).required()
    }
    return joi.validate(admins, schema)
}

var admin = mongoose.model('admin',adminSchema)

module.exports = {
    admin,
    validateSchema
}