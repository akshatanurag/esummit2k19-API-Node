const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const middleware = require('../middleware/middleware')
const {
    Profile
} = require('../models/profile')
const router = express.Router();
var crypto = require("crypto-js");
var salt = process.env.SALT 

const log = require('../config/bunyan-config');
const santizer = require('sanitizer');

router.get("/qr-gen", [middleware.isLoggedIn, middleware.isVerified, middleware.isProfileComplete,middleware.isKiitStudent,middleware.isPaid, middleware.hasSeat], async (req, res) => {
    try {
        var currentUserProfile = await Profile.findOne({
            main_email: req.user.email
        })
        if (!currentUserProfile)
            return res.status(400).send({
                success: false,
                message: "Profile was not found"
            })
        if(currentUserProfile.eventsChosen[1] && currentUserProfile.eventsChosen[2]){
        //console.log(currentUserProfile.eventsChosen[1].event_name)
        // qr_token = async (currentUserProfile) => {
        //     return await jwt.sign({
        //         _id: currentUserProfile.user_id,
        //         name: currentUserProfile.name,
        //         email: currentUserProfile.main_email
    
    
    
        //     }, config.get("jwtPrivateKey"))
        // }
        var token = currentUserProfile.main_email
        console.log(token)
        var enc_token = token
        if (!token || !enc_token)
            return res.status(400).send({
                success: false,
                message: "Tokens were not generated correctly"
            })
        return res.status(200).send({
            success: true,
            message: "here is your token, now go make a qr code out of this",
            token: enc_token
        })
        //var dec_token = crypto.AES.decrypt(enc_token, config.get('jwtPrivateKey')).toString(crypto.enc.Utf8);
        //console.log(qr_token(currentUserProfile));
        }
        else{
            return res.status(400).send({
                success: false,
                message: "Chosse events first"
            })
        }
    
    } catch (error) {
        log.error(error);
        return res.status(400).send({success: false, message: "Opps! Something went wrong"})
    }
    
})

/* 

    For the time being just have the user data, the adbility to udate live staus
    of participants will be added later

    Can't do that now have my exams :P 


*/

router.post("/qr-gen", middleware.isAdminLoggedIn, async (req, res) => {
    // if(req.body.token)
    // {
    //     var token =  req.body.token
    // }
    try {
        if (!req.body.token)
        return res.status(400).send({
            success: false,
            message: "Token was expected"
        })
    //dec_token = await crypto.AES.decrypt(santizer.escape(req.body.token), salt).toString(crypto.enc.Utf8);
    //console.log(dec_token);
    //var decoded = await jwt.verify(dec_token, config.get("jwtPrivateKey"))
    var userProfile = await Profile.findOne({
        main_email: req.body.token
    })
    if (!userProfile)
        return res.status(400).send({
            success: false,
            message: "Wrong jwt token"
        })
    return res.status(200).send({
        success: true,
        message: "Here is the user data use it wisely",
        userData: userProfile
    })
    } catch (e) {
        log.error(e);
    }

})
module.exports = router;