const express = require('express')
const {User} = require('../models/user');
var randomstring = require("randomstring");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt-nodejs')
const sanitizer = require('sanitizer');

const router = express.Router();

const sendMail = (token, email, host) => {
    //console.log(email);
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            /*This password is not meant for you, so do not misue it. I will be getting a notification on my phone, if you dare to login and
            if I am able to locate you, then consider yourself dead. I will eat your head off. _|_*/
            user: 'akshatanurag1998@gmail.com',
            pass: process.env.password
        }
    });
    var mailOptions = {
        to: email,
        from: 'KIIT E-Cell',
        subject: 'KIIT E-Cell Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + host + '/api/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    smtpTransport.sendMail(mailOptions, function (err) {
        if (err) {
            //console.log(err);
            return 0;
        } else {
            return 1;
        }
    });
}

router.post("/forgot",async (req,res)=>{
    var findUser = await User.findOne({
        email: sanitizer.escape(req.body.email)
    }).select('-password').select('-secureSessionID');
    if(!findUser)
    return res.status(400).send({error: "Email not registered"});
    let verifyToken = await randomstring.generate({
        length: 50,
        charset: 'hex'
    });
    findUser.resetEmailToken = verifyToken;
    findUser.resetEmailExpires = Date.now() + 3600000;
    await findUser.save();
    await sendMail(verifyToken,findUser.email,req.headers.host)
    return res.status(200).send({success: "Verification link sent"});
    })
router.get("/reset/:token",async (req,res)=>{
    var findUserByToken = await User.findOne({
        resetEmailToken: req.params.token,
        resetEmailExpires: { $gt: Date.now() }
    }).select('-password').select('-secureSessionID');
    if(!findUserByToken)
    return   res.status(400).send({
        error: "Reset token is invalid or has expired."
    });
    if(findUserByToken.resetEmailToken == req.params.token)
    {
        return res.status(200).send({success: "Enter new email by sending post request on /reset/:token"})
        //render reset form here
    }
    else
    {
        return   res.status(400).send({
            error: "Reset token is invalid or has expired."
        });
    }
})
router.post("/reset/:token",async (req,res)=>{
    var findUserByToken = await User.findOne({
        resetEmailToken: req.params.token,
        resetEmailExpires: { $gt: Date.now() }
    }).select('-password').select('-secureSessionID');
    if(!findUserByToken)
    return   res.status(400).send({
        error: "Reset token is invalid or has expired."
    });
    if(findUserByToken.resetEmailToken == req.params.token)
    {
        //return res.status(200).send({success: "Enter new email by sending post request on /reset/:token"})
        if(!req.body.password)
        return res.status(400).send({error: "Password not enterd"})
        findUserByToken.password = await bcrypt.hashSync(sanitizer.escape(req.body.password), bcrypt.genSaltSync(10), null);
        findUserByToken.resetEmailToken= undefined;
        findUserByToken.resetEmailExpires= undefined
        await findUserByToken.save()
        return res.status(200).send({success: 'Email reset successful'});
    }
    else
    {
        return   res.status(400).send({
            error: "Reset token is invalid or has expired."
        });
    }
})


module.exports = router;