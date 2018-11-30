const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const middleware = require('../middleware/middleware')
const {Profile} = require('../models/profile')
const router = express.Router();
var crypto = require("crypto-js");
var salt = "kiitecellislove"
router.get("/qr-gen",[middleware.isLoggedIn, middleware.isVerified, middleware.isProfileComplete, middleware.isPaid, middleware.hasSeat],async (req,res)=>{
    var currentUserProfile = await Profile.findOne({main_email: req.user.email})
    if(!currentUserProfile)
    return res.status(400).send({error: "Profile was not found"})
    console.log(currentUserProfile.eventsChosen[1].event_name)
    qr_token = (currentUserProfile)=>{
        return jwt.sign({
            _id: currentUserProfile.user_id,
            name: currentUserProfile.name,
            email: currentUserProfile.main_email,



        }, config.get('jwtPrivateKey'))
    }
    var token = qr_token(currentUserProfile)
    var enc_token = crypto.AES.encrypt(token,salt).toString()
    return res.status(200).send({succcess: "here is your token make a qr code out of this",
                                token: enc_token})
    //var dec_token = crypto.AES.decrypt(enc_token, config.get('jwtPrivateKey')).toString(crypto.enc.Utf8);
    //console.log(qr_token(currentUserProfile));

})

router.post("/qr-gen",[middleware.isLoggedIn, middleware.isVerified, middleware.isProfileComplete, middleware.isPaid, middleware.hasSeat],async (req,res)=>{
    // if(req.body.token)
    // {
    //     var token =  req.body.token
    // }
    if(!req.body.token)
    return res.status(400).send({error: "Token was expected"})
    dec_token = await crypto.AES.decrypt(req.body.token, salt).toString(crypto.enc.Utf8);
    console.log(dec_token);
    var decoded = await jwt.verify(dec_token,config.get('jwtPrivateKey'))
    var userProfile = await Profile.findOne({main_email: decoded.email})
    if(!userProfile)
    return res.status(400).send({error: "Wrong jwt token"})
    return res.status(200).send({success: "Here is the user data use it wisely",
                            userData: userProfile})
})
module.exports = router;