const mongoose = require('mongoose')


var allSeatsSchema = new mongoose.Schema({
    name: String,
    seats: Number,
    players: [{
        fullName: String,
        main_email: String,
        es_id: String,
        mob_no: String,
        w_mob_no: String,
        uni: String,
        user_id: mongoose.Schema.Types.ObjectId
    }],
    r_seats: Number
})

var allSeats = mongoose.model("total_seats", allSeatsSchema)

module.exports = allSeats;