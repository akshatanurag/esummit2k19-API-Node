/*
    The page does not have santizer in it. Will ad it later too much work now!!1

*/

const express = require('express');
const _ = require('lodash');
var randomstring = require("randomstring");

const {
    Profile,
    validate
} = require('../models/profile');
const {
    User
} = require('../models/user');
const middleware = require('../middleware/middleware');
const log = require('../config/bunyan-config');
const router = express.Router();

router.post("/profile", [middleware.isLoggedIn, middleware.isVerified], async (req, res) => {
    try {
        var findUser = await (User.findOne({
            email: req.user.email
        })).select('-password').select('-secureSessionID');
        if (!findUser)
            return res.status(400).send({
                success: false,
                message: "Opps!Something went wrong"
            })
    
        var findProfile = await Profile.findOne({
            user_id: findUser._id
        });
        if (findProfile)
            return res.status(400).send({
                success: false,
                message: "Opps!Looks like you have already done that"
            })
        //console.log(findUser._id)
        const {
            error
        } = validate(req.body);
        if (error) return res.status(400).send({
            success: false,
            message: error.details[0].message
        });
        var profile = new Profile(_.pick(req.body, ["fullName", "alt_email", "mob_no", "w_mob_no", "roll", "uni", "gender", "year"]));
        if ((profile.gender == 'M' || profile.gender == 'F' || profile.gender == 'O') && (profile.year < 5)) {
    
            profile.main_email = findUser.email;
            profile.user_id = findUser._id
            let randString = await randomstring.generate({
                length: 4,
                charset: 'alphanumeric'
            });
            //console.log(randString);
            profile.es_id = `ES_${randString}`
            profile.profileComplete = true
            await profile.save();
            return res.status(200).send({
                success: true,
                message: "Profile has been saved"
            })
        } else {
    
            return res.status(400).send({
                success: false,
                message: "Some wrong values were sent"
            })
        }
    
    } catch (error) {
        log.error(error);
        return res.status(400).send({
            success: false,
            message: 'Opps! Something went wrong'
        })
    }
   
})


module.exports = router;