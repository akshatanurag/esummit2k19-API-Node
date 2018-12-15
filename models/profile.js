const mongoose = require('mongoose');
const joi = require('joi');

var profileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: "user"
    },
    fullName: {
        type: String,
        required: true,
        minlength: 1
    },
    uni: {
        type: String,
        required: true,
        minlength: 1
    },
    main_email: {
        type: String,
        required: true,
        minlength: 5
    },
    alt_email: {
        type: String,
        minlength: 5
    },
    roll: {
        type: String,
        required: true,
        minlength: 1
    },
    mob_no: {
        type: String,
        required: true,
        minlength: 10
    },
    w_mob_no: {
        type: String,
        required: true,
        minlength: 10
    },
    profileComplete: {
        type: Boolean,
        default: false
    },
    es_id: {
        type: String,
        required: true,
        unique: true
    },
    seatSafe: {
        type: Boolean,
        default: false
    },
    eventsChosen: [{
        event_name: String
    }],
    selectedTwoEvents: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    kiitMailVerifyToken:  String,
    kiitMailVerfyStatus:{
        type: Boolean,
        default: false
    }
})

function validateSchema(profile) {
    const schema = {

        fullName: joi.string().min(1).max(50).required(),
        alt_email: joi.string().min(5).max(255).email(),
        uni: joi.string().min(1).max(255).required(),
        roll: joi.number().required(),
        mob_no: joi.number().min(10).required(),
        w_mob_no: joi.number().min(10).required(),
        year: joi.number().min(1).required(),
        gender: joi.string().min(1).required()
        



    }
    return joi.validate(profile, schema)
}

var Profile = mongoose.model("profile", profileSchema)

module.exports = {
    Profile,
    validate: validateSchema
}