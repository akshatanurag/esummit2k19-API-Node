/* 
    Yeah! ik the code on this page is way too fucked up. Do not attempt to undestand it.
    The route was having too many bugs, below you will see my deperate attempts to resolve the issues,
    it's just that the code works.

    I will refactor the code later, Kindly use this for now, due to less time I coded whatever I could...



    |----------------------------------------------------------------------------------------------|
    |This code sucks, you know it and I know it. But yeah,rest of the pages are fucking awesome <3 |
    |----------------------------------------------------------------------------------------------|


    --Btw, I noticed just now--
    OMFG! the page takes 4437ms to repond. So fuckin dead. I need to make this better very soon

    =======
    Date: 6/12/18
    =======
    SOLVED IT *120ms* !! YEAH :B

*/

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

router.get("/dashboard", [middleware.isLoggedIn, middleware.isVerified, middleware.isProfileComplete, middleware.isPaid], async (req, res) => {

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


})

router.post("/dashboard/choose-events", [middleware.isLoggedIn, middleware.isVerified, middleware.isProfileComplete, middleware.isPaid, middleware.hasSeat, middleware.hasSelectedTwoEvents], async (req, res) => {
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


})

router.get("/dashboard/choose-events", async (req, res) => {
    var seatStatus = await allSeats.find({}).select("-players")
    res.status(200).send(seatStatus);
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
/**
* For the brave souls who get this far: You are the chosen ones,
* the valiant knights of programming who toil away, without rest,
* fixing our most awful code. To you, true saviors, kings of men,
* I say this: never gonna give you up, never gonna let you down,
* never gonna run around and desert you. Never gonna make you cry,
* never gonna say goodbye. Never gonna tell a lie and hurt you.
*=============
*
*   Yep just copied that from stackoverflow XD!! But yeah seriouly if you are here
*   Then you are awesome. Because I am not awesome :P
*
*   When I wrote this, only God and I understood what I was doing
*   Now, God only knows
*
*===============   
*/


}

module.exports = router;