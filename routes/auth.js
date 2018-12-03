const express = require('express')
const _ = require('lodash');
const router = express.Router();
var randomstring = require("randomstring");
const sanitizer = require('sanitizer')

const {
    User,
    validate
} = require('../models/user');

const middleware = require('../middleware/middleware')
const nodemailer = require('nodemailer');


const sendMail = async (token, email, host) => {
    //console.log(email);
    var smtpTransport = await nodemailer.createTransport({
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
    sentMail = await smtpTransport.sendMail(mailOptions);
    if(sentMail)
    return true;
    else
    return false
}

router.post("/signup", async (req, res) => {
    try {
        if(!req.body.email || !req.body.password)
        throw "error";
        if (await User.findOne({
                email: sanitizer.escape(req.body.email)
            })) {
            return res.status(400).send({success: false,
                message: "Email taken"
            });
        }
    
        const {
            error
        } = validate(req.body);
        if (error) return res.status(400).send({
            success: false,
            message: error.details[0].message
        });
        var user = new User(_.pick(req.body, ['name', 'email']));
        user.password = user.generateHash(sanitizer.escape(req.body.password));
        // console.log(req.user._id)
        const token = user.generateAuthToken(sanitizer.escape(req.body.email))
        let verifyToken = randomstring.generate({
            length: 50,
            charset: 'hex'
        });
        //console.log(verifyToken);
        user.resetPasswordToken = verifyToken;
        user.secureSessionID = randomstring.generate({
            length: 20,
            charset: 'hex'
        });
        user.dateJoined = Date.now()
        //user.resetPasswordExpires = Date.now() + 86400000; // 24 hour
        sentMail = await sendMail(verifyToken, req.body.email, req.headers.host);
        if(sendMail){
            await user.save()
            res.header('x-auth-token', token).send({success: true,message: "Sign up successful"});
        }
        else{
            res.status(200).send({success: false,message: "Unable to sign up"})
        }
    } catch (error) {
        return res.status(400).send({
            success: false,
            message: "Uable to sign you up"
        })
    }




})

router.post("/login", middleware.isVerified, async (req, res) => {
    try {
        
    if(!req.body.email || !req.body.password)
    throw "error";

    var findUser = await User.findOne({
        email: sanitizer.escape(req.body.email)
    })
    if (!findUser) {
        return res.status(400).send({
            success: false,
            message: "Invalid email or passwrod"
        });
    }

    var newUser = User()
    if (!newUser.validPassword(sanitizer.escape(req.body.password), findUser.password)) {
        return res.status(400).send({
            success: false,
            message: "Invalid email or passwrod"
        });
    }
    const token = newUser.generateAuthToken(req.body.email)
    req.session.secure = findUser.secureSessionID;
    return res.header('x-auth-token', token).status(200).send({
        success: true,
        message: "logged in"
    });
    } catch (error) {
        return res.status(400).send({
            success : false,
            message: "Opps! something went wrong"
        })
    }

})

router.get("/logout", middleware.isLoggedIn, async (req, res) => {
    req.session.secure = undefined;
    res.header('x-auth-token', null).status(200).send({
        success: "Logged out"
    });
})



// router.get("/getdata", [middleware.isLoggedIn, middleware.isVerified], async (req, res) => {
//     User.findOne({
//         email: req.user.email
//     }).select('-password').select('-secureSessionID').then((result) => {
//         res.status(200).send({
//             success: result
//         })
//     }).catch((err) => {
//         console.log(err)
//     });
// })


router.get("/verify/:token", (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.token,
        //resetPasswordExpires: { $gt: Date.now() }
    }).then((m) => {
        m.resetPasswordToken = undefined,
            //m.resetPasswordExpires= undefined,
            m.isEmailVerified = 1
        m.save();
        console.log(m);
        res.status(200).send({
            success: "Email Verified"
        });
    }, (e) => {
        console.log(e);
        res.status(400).send({
            error: "Verification token is invalid or has expired."
        });
    }).catch((e) => {
        console.log(e);
        res.status(400).send({
            error: "Verification token is invalid or has expired."
        });
    })



})

module.exports = router;
