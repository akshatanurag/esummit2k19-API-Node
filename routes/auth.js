const express = require('express')
const _ = require('lodash');
const router = express.Router();
var randomstring = require("randomstring");
var sanitizer = require('sanitizer');

const {
    User,
    validate
} = require('../models/user');

const middleware = require('../middleware/middleware')
const nodemailer = require('nodemailer');


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
        subject: 'KIIT E-Cell email verify',
        text: 'You are receiving this because you (or someone else) has registered your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the verfication process:\n\n' +
            'http://' + host + '/api/verify/' + token + '\n\n' +
            'If you did not request this.\n'
    };
    smtpTransport.sendMail(mailOptions, function (err) {
        if (err) {
            // console.log(err);
            return 0;
        } else {
            return 1;
        }
    });
}

router.post("/signup", async (req, res) => {
     var s_email = sanitizer.escape(req.body.email);
    if (await User.findOne({
            email: s_email
        })) {
        return res.status(400).send({
            error: "Email taken"
        });
    }

    const {
        error
    } = validate(req.body);
    if (error) return res.status(400).send({
        error: error.details[0].message
    });
    var user = new User(_.pick(req.body, ['name', 'email']));
    var s_name = sanitizer.escape(user.name);
    var s_password = sanitizer.escape(user.password)
    user.name = s_name;
    user.password = user.generateHash(s_password);
    //console.log(`${user.name} ${user.password}`)
    // console.log(req.user._id)
    const token = user.generateAuthToken(s_email)
    let verifyToken = randomstring.generate({
        length: 50,
        charset: 'hex'
    });
    // console.log(verifyToken);
    user.resetPasswordToken = verifyToken;
    user.secureSessionID = randomstring.generate({
        length: 20,
        charset: 'hex'
    });
    user.dateJoined = Date.now()
    //user.resetPasswordExpires = Date.now() + 86400000; // 24 hour
    await user.save()
    await sendMail(verifyToken, s_email, req.headers.host);
    await res.header('x-auth-token', token).redirect("/api");


})

router.post("/login", middleware.isVerified, async (req, res) => {
    var s_email = sanitizer.escape(req.body.email)
    // console.log(s_email);
    
    var s_password = sanitizer.escape(req.body.password)
    // console.log(s_password)
    var findUser = await User.findOne({
        email: s_email
    })
    if (!findUser) {
        return res.status(400).send({
            error: "Invalid email or passwrod 1"
        });
    }

    var newUser = User()
    if (!newUser.validPassword(s_password, findUser.password)) {
        return res.status(400).send({
            error: "Invalid email or passwrod"
        });
    }
    const token = newUser.generateAuthToken(s_email)
    req.session.secure = findUser.secureSessionID;
    return res.header('x-auth-token', token).status(200).send({
        success: "logged in"
    });
})

router.get("/logout", middleware.isLoggedIn, async (req, res) => {
    
    req.session = null;
    res.header('x-auth-token', undefined).status(200).send({
        success: "Logged out"
    });
})



router.get("/getdata", [middleware.isLoggedIn, middleware.isVerified], async (req, res) => {
    User.findOne({
        email: req.user.email
    }).select('-password').select('-secureSessionID').then((result) => {
        res.status(200).send({
            success: result
        })
    }).catch((err) => {
        //console.log(err)
    });
})


router.get("/verify/:token", (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.token,
        //resetPasswordExpires: { $gt: Date.now() }
    }).then((m) => {
        m.resetPasswordToken = undefined,
            //m.resetPasswordExpires= undefined,
            m.isEmailVerified = 1
        m.save();
        //console.log(m);
        res.status(200).send({
            success: "Email Verified"
        });
    }, (e) => {
        //console.log(e);
        res.status(400).send({
            error: "Verification token is invalid or has expired."
        });
    }).catch((e) => {
        //console.log(e);
        res.status(400).send({
            error: "Verification token is invalid or has expired."
        });
    })



})

module.exports = router;