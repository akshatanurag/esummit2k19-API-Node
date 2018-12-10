const express = require('express')
const {
    User
} = require('../models/user');
var randomstring = require("randomstring");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt-nodejs')
const sanitizer = require('sanitizer');
const log = require('../config/bunyan-config')
const mailer = require('../config/sendgrid-mail');
const router = express.Router();
var owasp = require('owasp-password-strength-test');


owasp.config({
    allowPassphrases: true,
    maxLength: 128,
    minLength: 5,
    minPhraseLength: 20,
    minOptionalTestsToPass: 4,
});

// const sendMail = async (token, email, host) => {
//     //console.log(email);
//     var smtpTransport = await nodemailer.createTransport({
//         service: 'SendGrid',
//         auth: {
//             /*This password is not meant for you, so do not misue it. I will be getting a notification on my phone, if you dare to login and
//             if I am able to locate you, then consider yourself dead. I will eat your head off. _|_*/
//             user: 'techieAkshat',
//             pass: 'Anurag2@3'
//             //pass: "wrong"
//         }
//     });
//     var mailOptions = {
//         to: email,
//         from: 'KIIT E-Cell',
//         subject: 'KIIT E-Cell Password Reset',
//         text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//             'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//             'http://' + host + '/api/reset/' + token + '\n\n' +
//             'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//     };
//     sentMail = await smtpTransport.sendMail(mailOptions);
//     if (sendMail)
//         return true;
//     else
//         return false;
// }

router.post("/forgot", async (req, res) => {
    try {
        var findUser = await User.findOne({
            email: sanitizer.escape(req.body.email)
        }).select('-password').select('-secureSessionID');

        if (!findUser)
            return res.status(400).send({
                success: false,
                message: "Email not registered"
            });

        let verifyToken = await randomstring.generate({
            length: 50,
            charset: 'hex'
        });
        findUser.resetEmailToken = verifyToken;
        findUser.resetEmailExpires = Date.now() + 3600000;
        //sentMail = await sendMail(verifyToken, findUser.email, req.headers.host)
        let sentMail = await mailer.sendMail(
            verifyToken,
            req.body.email,
            req.headers.host,
            'reset'
          );
          if (sentMail) {
            await findUser.save();
            res.status(200).send({
              success: true,
              message: 'Email verification link sent'
            });
          } else {
            res.status(400).send({
              success: false,
              message: 'Unable to send the verification link'
            });
          }
    } catch (error) {
        log.error(error);
        return res.status(500).send({
            success: false,
            message: "We were unable to send the reset password link please try again later"
        })
    }
})

router.get("/reset/:token", async (req, res) => { //render the form here to get the new password
    try {
        var findUserByToken = await User.findOne({
            resetEmailToken: req.params.token,
            resetEmailExpires: {
                $gt: Date.now()
            }
        }).select('-password').select('-secureSessionID');
        if (!findUserByToken)
            return res.status(400).send({
                success: false,
                message: "Reset token is invalid or has expired."
            });
        if (findUserByToken.resetEmailToken == req.params.token) {
            return res.status(200).send({
                success: true,
                message: "Enter new password by sending post request on this exact route"
            })
            //render reset form here
        } else {
            return res.status(400).send({
                success: false,
                message: "Reset token is invalid or has expired."
            });
        }
    } catch (error) {
        log.error(error)      
        return res.status(400).send({
            success: false,
            message: "Reset token is invalid or has expired."
        })
    }

})
router.post("/reset/:token", async (req, res) => {
    try {
        var findUserByToken = await User.findOne({
            resetEmailToken: req.params.token,
            resetEmailExpires: {
                $gt: Date.now()
            }
        }).select('-password').select('-secureSessionID');
        if (!findUserByToken)
            return res.status(400).send({
                success: false,
                message: "Reset token is invalid or has expired."
            });
        if (findUserByToken.resetEmailToken == req.params.token) {
            //return res.status(200).send({success: "Enter new email by sending post request on /reset/:token"})
            if (!req.body.password)
                return res.status(400).send({
                    success: false,
                    message: "Password not enterd"
                })
                var passStrength = owasp.test(req.body.password)
                if (passStrength.errors.length > 0)
                    return res.status(400).send({
                        errors: passStrength.errors
                    });
            findUserByToken.password = await bcrypt.hashSync(sanitizer.escape(req.body.password), bcrypt.genSaltSync(10), null);
            findUserByToken.resetEmailToken = undefined;
            findUserByToken.resetEmailExpires = undefined
            await findUserByToken.save()
            return res.status(200).send({
                success: true,
                message: 'Password reset successful'
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "Reset token is invalid or has expired."
            });
        }
    } catch (error) {
        log.error(error);
        return res.status(400).send({
            success: false,
            message: "Reset token is invalid or has expired."
        });
    }

})

module.exports = router;