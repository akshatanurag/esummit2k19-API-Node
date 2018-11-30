const jwt = require('jsonwebtoken');
const config = require('config')
const {
    User
} = require('../models/user');
const {
    Profile
} = require('../models/profile');

const seatInfo = require('../models/allSeats');

const fetchUser = async (email) => {
    var findUser = await User.findOne({
        email: email
    }).select('-password')
    if (!findUser)
        return 0;
    return findUser;
}

const fectchSeatInfo = async (id) => {
    var findSeatInfo = await seatInfo.findOne({
        name: id
    });
    if (!findSeatInfo)
        return 0;
    return findSeatInfo;
}
module.exports = {
    isLoggedIn: async function (req, res, next) {
        const token = req.header('x-auth-token');
        if (!token)
            return res.status(401).send({
                error: 'Access denied'
            });
        try {
            const decoded = jwt.verify(token,'qwertyuiop');
            req.user = decoded;
            if (req.user)
                var email = req.user.email
            else
                var email = req.body.email
            var currentUser = await fetchUser(email)
            if (currentUser == 0)
                return res.status(400).send({
                    error: "No user was found"
                });
            console.log(currentUser.secureSessionID);
            console.log(req.session.secure)
            if (req.session.secure != undefined && currentUser.secureSessionID != undefined && req.session.secure == currentUser.secureSessionID)
                next();
            else
                return res.status(401).send({
                    error: 'Invalid Session'
                });

            //next();

        } catch (error) {
            res.status(400).send({
                error: 'Invalid Token'
            });
        }

    },
    isVerified: async function (req, res, next) {
        if (req.user)
            var email = req.user.email
        else
            var email = req.body.email
        var currentUser = await fetchUser(email)
        if (currentUser == 0)
            return res.status(400).send({
                error: "No user was found"
            });
        if (currentUser.isEmailVerified == 1)
            next();
        else
            return res.status(401).send({
                error: 'Email not verified'
            });
    },
    isProfileComplete: async function (req, res, next) {
        var findProfile = await Profile.findOne({
            main_email: req.user.email
        })
        if (!findProfile)
            return res.status(400).send({
                error: "Profile was not found"
            })
        if (findProfile.profileComplete)
            next()
        else
            return res.status(400).send({
                error: "Profile not completed yet"
            })
    },
    isPaid: async function (req, res, next) {
        var currentUser = await fetchUser(req.user.email);
        if (currentUser == 0)
            return res.status(400).send({
                error: "No user was found"
            });
        if (currentUser.payments.isPaid) {
            next();
            // var headers = {
            //     'X-Api-Key': 'test_c10c242d09fa6d2792deed0c82a',
            //     'X-Auth-Token': 'test_984665af47a659c0a4af0eef5a2'
            // }
            // await request.get(`https://test.instamojo.com/api/1.1/payment-requests/${currentUser.payments.payment_id}/`, {
            //     headers: headers
            // }, async function (error, response, body) {
            //     if (!error && response.statusCode == 200) {
            //         obj = JSON.parse(body)
            //         //console.log(obj.payment_request.payments[0]);
            //         if (obj.payment_request.payments[0].status == 'Credit')
            //             next()
            //     }
            // })
        } else
            return res.status(401).send({
                error: "You need to pay first"
            });
    },
    isSeatLeft: async function (req, res, next) {
        var currentUser = await fetchUser(req.user.email)
        if (currentUser.uni == "kiit university") {
            var seatStatus = await fectchSeatInfo('All Seats')
            if (seatStatus != 0) {
                if (seatStatus.seats > 0)
                    next()
                else
                    return res.status(401).send({
                        error: "Sorry! we are full"
                    });
            }
        } else {
            var seatStatus = await fectchSeatInfo('All Seats')
            if (seatStatus != 0) {
                if (seatStatus.r_seats > 0)
                    next()
                else
                    return res.status(401).send({
                        error: "Sorry! we are full"
                    });
            }
        }
    },
    hasSeat: async function (req, res, next) {
        var userProfile = await Profile.findOne({
            main_email: req.user.email
        })
        if (!userProfile)
            return res.status(400).send({
                error: "No user was found"
            })
        if (userProfile.seatSafe)
            next()
        else
            return res.status(400).send({
                error: "Visit dashboard before choosing events"
            });
    },
    hasSelectedTwoEvents: async function (req, res, next) {
        var userProfile = await Profile.findOne({
            main_email: req.user.email
        })
        if (!userProfile)
            return res.status(400).send({
                error: "No user profile was found"
            })
        console.log(userProfile.selectedTwoEvents)
        console.log(userProfile.eventsChosen.length)
        if (userProfile.selectedTwoEvents == false && userProfile.eventsChosen.length < 4)
            next()
        else
            return res.status(400).send({
                error: "Done that already? "
            })
    }


}