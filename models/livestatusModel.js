const mongoose = require('mongoose')


var liveStatusSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    idIssued: {
        type: Boolean,
        default: false
    },
    opening: {
        type: Boolean,
        default: false
    },
    //Day 1
    td1:{
        type: Boolean,
        default: false
    },
    clash:{
        type: Boolean,
        default: false
    },
    wolf: {
        type: Boolean,
        default: false
    },
    dinnerD1:{
        type: Boolean,
        default: false
    },
    //Day 2
    td2:{
        type: Boolean,
        default: false
    },
    td3: {
        type: Boolean,
        default: false
    },
    td4: {
        type: Boolean,
        default: false
    },
    icamp: {
        type: Boolean,
        default: false
    },
    closing: {
        type: Boolean,
        default: false
    },
    dinnerD2:{
        type: Boolean,
        default: false
    },
    bplan: {
        type: Boolean,
        default: false
    },
    youtube: {
        type: Boolean,
        default: false
    },
    oc_id: {
        type: String,
        required: true
    }


})

var liveStatus = mongoose.model("live_status", liveStatusSchema)

module.exports = {
    liveStatus
}
