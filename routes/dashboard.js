const express = require('express');
const middleware = require('../middleware/middleware');
const allSeats = require('../models/allSeats');
const _ = require('lodash');
const {
    Profile
} = require('../models/profile')
const router = express.Router();
const sanitizer = require('sanitizer')
var fetchUserProfile = async (email) => {
    var findProfile = await Profile.findOne({
        main_email: email
    })
    if (!findProfile)
        return 0;
    return findProfile;
}
const log = require('../config/bunyan-config')


var insertIntoTotSeats = async (eventName, playersData, palyerData, email, res) => {
    for (var i = 0; i < playersData.players.length; i++) {
        if (playersData.players.length != 0) {
            if (playersData.players[i].main_email == email)
                return 0;
        } else {
            var status = await InsertDataAfterCheck(eventName, playersData, palyerData, email, res)
            if (status == 1)
                return 1;
            else
                return 0;
        }

    }
    var status = await InsertDataAfterCheck(eventName, playersData, palyerData, email, res)
    if (status == 1)
        return 1;
    else
        return 0;
}

var InsertDataAfterCheck = async (eventName, playersData, palyerData, email, res) => {
    //var eventObj = JSON.parse(eventName)
    if (palyerData.uni == "kiit university") {
        await allSeats.findOneAndUpdate({
            name: eventName
        }, {
            $push: {
                players: palyerData
            },
            seats: playersData.seats - 1
        })

        await Profile.findOneAndUpdate({
            main_email: email
        }, {
            $push: {
                eventsChosen: {
                    event_name: eventName
                }
            }
        })
        return 1;
    } else {
        await allSeats.findOneAndUpdate({
            name: eventName
        }, {
            $push: {
                players: palyerData
            },
            r_seats: playersData.r_seats - 1
        })
        await Profile.findOneAndUpdate({
            main_email: email
        }, {
            $push: {
                eventsChosen: {
                    event_name: eventName
                }
            }
        })
        return 1;
    }
}

router.get("/dashboard", [middleware.isLoggedIn, middleware.isVerified, middleware.isProfileComplete,middleware.isKiitStudent,middleware.isPaid], async (req, res) => {
    try {
        var userProfile = await fetchUserProfile(req.user.email)
        if (userProfile.seatSafe) {
            return res.status(200).send({
                success: "Welcome to dashboard"
            });
        } else {
            let palyerData = await fetchUserProfile(req.user.email)
            var playersData = await allSeats.findOne({
                name: 'All Seats'
            })
    
            var status = await insertIntoTotSeats('All Seats', playersData, palyerData, req.user.email, res);
    
            if (status == 1) {
                await Profile.findOneAndUpdate({
                    main_email: req.user.email
                }, {
                    seatSafe: true
                })
                return res.status(200).send({
                    sucees: "We have saved a seat for you"
                })
            } else {
                return res.status(200).send({
                    error: "Opps! something went wrong"
                })
            }
    
        }
    } catch (error) {
        log.error(error)
        return res.status(200).send({
            error: "Opps! something went wrong"
        })
    }
   


})

router.post("/dashboard/choose-events", [middleware.isLoggedIn, middleware.isVerified, middleware.isProfileComplete,middleware.isKiitStudent,middleware.isPaid, middleware.hasSelectedTwoEvents], async (req, res) => {
    try {
        var event = _.pick(req.body, ["event1", "event2"]);
    if (!event.event1 || !event.event2)
        return res.status(400).send({
            error: "No event was chosen"
        });
    let palyerData = await fetchUserProfile(req.user.email)
    //s(n)_d1
    var status1 = await sessionHandler_1(sanitizer.escape(event.event1),sanitizer.escape(event.event2), palyerData, req, res)
    //console.log(`status1: ${status1}`)
    //s(n)_d2
    //var status2 = await sessionHandler_2(event.event2, req, res)
    //console.log(status2)
    if (status1 == 1) {
        await Profile.findOneAndUpdate({
            main_email: req.user.email
        }, {
            selectedTwoEvents: true
        })
        return res.status(200).send({
            success: "Session have been selected"
        })
    } else if (!status1) {
        return res.status(400).send({
            error: "in function wrong call"
        })
    } else {
        return res.status(400).send({
            error: "Opps! Something went wrong 1"
        })
    }
    } catch (error) {
        log.error(error);
        return res.status(400).send({
            error: "Opps! Something went wrong 1"
        })
    }
    


})

router.get("/dashboard/choose-events", async (req, res) => {
    try {
        var seatStatus = await allSeats.find({}).select("-players")
        res.status(200).send(seatStatus);
    } catch (error) {
        log.error(error);
    }

})

var sessionHandler_1 = async (eventName, eventName2, palyerData, req, res) => {
    //console.log(eventName)
    //console.log(eventName2)
    if ((eventName == "S1_D1" || eventName == "S2_D1") && (eventName2 == "S1_D2" || eventName2 == "S2_D2")) {
        //console.log("this runs")

        var playersData = await allSeats.findOne({
            name: eventName
        })
        if (!playersData)
            return res.status(400).send({
                error: "Wrong event selected"
            })
        if (palyerData.uni == 'kiit university' && playersData.seats > 0)
            var status = await insertIntoTotSeats(eventName, playersData, palyerData, req.user.email, res);
        else if (palyerData.uni != 'kiit university' && playersData.r_seats > 0)
            var status = await insertIntoTotSeats(eventName, playersData, palyerData, req.user.email, res);
        else
            return res.status(400).send({
                error: "Sorry we are full"
            });
        if (status == 1) {
            var status2 = await sessionHandler_2(eventName2, palyerData, req, res)
            if (status2 == 1)
                return 1;
            else
                return 0;
        } else {
            return 0;
        }

    } else {
        return 0;
    }



}

var sessionHandler_2 = async (eventName, palyerData, req, res) => {
    if (eventName == "S1_D2" || eventName == "S2_D2") {
        //let palyerData = await fetchUserProfile(req.user.email)
        var playersData = await allSeats.findOne({
            name: eventName
        })
        if (palyerData.uni == 'kiit university' && playersData.seats > 0)
            var status = await insertIntoTotSeats(eventName, playersData, palyerData, req.user.email, res);
        else if (palyerData.uni != 'kiit university' && playersData.r_seats > 0)
            var status = await insertIntoTotSeats(eventName, playersData, palyerData, req.user.email, res);
        else
            return res.status(400).send({
                error: "Sorry we are full"
            });
        if (status == 1)
            return 1;
        else
            return 0;
    } else {
        return 0;
    }



}

module.exports = router;