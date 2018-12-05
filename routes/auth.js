const express = require('express')
const _ = require('lodash');
const router = express.Router();
var randomstring = require("randomstring");
const sanitizer = require('sanitizer')
var owasp = require('owasp-password-strength-test');

const url = require('url')

owasp.config({
    allowPassphrases: true,
    maxLength: 128,
    minLength: 5,
    minPhraseLength: 20,
    minOptionalTestsToPass: 4,
});

const {
    User,
    validate
} = require('../models/user');

const google = require('../config/google-util')

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
    if (sentMail)
        return true;
    else
        return false
}

/**
 * 
 * AUTHENTICATION WITH GOOGLE
 * 
 */

router.get("/auth/google", async (req, res) => {
    try {
        return res.status(200).send({
            url: google.urlGoogle()
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: "Opps! Something went wrong."
        })
    }

})

router.get("/auth/google/callback",async (req,res)=>{
        try {
            var q = url.parse(req.url, true);
            if (q.query.code) {
                var data = await google.getGoogleAccountFromCode(q.query.code)
                var user = User()
                /**
                 * 
                 * Now this is where magic happens.!!!
                 * 
                 * One reguest for both login and signup, amazing right. Wish I would've used simple google auth without passport before, It's simeple and 
                 * gives you much more flexiblity
                 * 
                 * Anyways, here we compare the database for the email sent by google 
                 * if we finde it then we simply set the session to users session and send response accoding ly
                 * 
                 */
                if (currUser = await User.findOne({
                        email: data.email
                    })) {
                    const token = user.generateAuthToken(data.email)
                    req.session.secure = currUser.secureSessionID;
                    return res.header('x-auth-token', token).status(200).send({
                        success: true,
                        message: "logged in"
                    });
                }
                /**
                 * now this will only run if the user is not registered with us 
                 * 
                 * basically we get the users details save in the db, 
                 * 
                 * Now, here since I don't get password and all from google, I simply put the users token here. Which will never be user used, 
                 * also I am too lazy to change the db schema now. So..:p
                 * 
                 * And the worst part if the user is not registered on google+, it deos not return a username (fuckers!!)
                 * 
                 * Anyways for that I have stored "Not set in gmail" as name of the user.
                 * again too lazy to change this(schema required it so...) 
                 *
                 *  */
                var user = new User();
                //console.log(data)
                if (data.name == '')
                    user.name = 'Not Set in gmail'
                else
                    user.name = data.displayName
                user.email = data.email
                user.password = data.tokens.id_token
                user.secureSessionID = randomstring.generate({
                    length: 20,
                    charset: 'hex'
                });
                const token = user.generateAuthToken(data.email)
                user.dateJoined = Date.now()
                await user.save()
                await res.header('x-auth-token', token).send({
                    success: true,
                    message: "Sign up successful"
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: "Page not found"
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(400).send({
                success: false,
                message: "Opps! Uanbe to login/sign-up"
            })
        }
})





router.post("/signup", async (req, res) => {
    try {
        if (!req.body.email || !req.body.password)
            throw "error";

        var passStrength = owasp.test(req.body.password)
        if (passStrength.errors.length > 0)
            return res.status(400).send({
                errors: passStrength.errors
            });

        if (await User.findOne({
                email: sanitizer.escape(req.body.email)
            })) {
            return res.status(400).send({
                success: false,
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
        if (sendMail) {
            await user.save()
            res.header('x-auth-token', token).send({
                success: true,
                message: "Sign up successful"
            });
        } else {
            res.status(200).send({
                success: false,
                message: "Unable to sign up"
            })
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

        if (!req.body.email || !req.body.password)
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
            success: false,
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