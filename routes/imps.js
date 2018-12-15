const express = require('express');
const _ = require('lodash');
var randomstring = require('randomstring');
const sanitizer = require('sanitizer');
var owasp = require('owasp-password-strength-test');
const mailer = require('../config/sendgrid-mail');
const url = require('url');

const {impsUser,validate} = require('../models/imps_user');
const log = require('../config/bunyan-config');

const impsMiddleware = require('../middleware/imps_middleware')


owasp.config({
  allowPassphrases: true,
  maxLength: 128,
  minLength: 5,
  minPhraseLength: 20,
  minOptionalTestsToPass: 4
});

const router = express.Router();

router.get("/",(req,res)=>{
    return  res.status(200).send({success: true, message: "Show info about imps here"})
});



router.post("/register",impsMiddleware.doNotShowRegisterPage,async (req,res)=>{
    try {
        if (!req.body.email || !req.body.password) throw 'error';
        var passStrength = owasp.test(req.body.password);
        if (passStrength.errors.length > 0)
          return res.status(400).send({
            errors: passStrength.errors
          });
    
        if (
          await impsUser.findOne({
            email: sanitizer.escape(req.body.email)
          })
        ) {
          return res.status(400).send({
            success: false,
            message: 'Email taken'
          });
        }
    
        const { error } = validate(req.body);
        if (error)
          return res.status(400).send({
            success: false,
            message: error.details[0].message
          });
        var user = new impsUser(_.pick(req.body, ['name', 'email']));
        user.password = user.generateHash(sanitizer.escape(req.body.password));
        // console.log(req.user._id)
        const token = user.generateAuthToken(sanitizer.escape(req.body.email));
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
        user.dateJoined = Date.now();
        user.singUpType = 'Normal';
        //user.resetPasswordExpires = Date.now() + 86400000; // 24 hour
        let sentMail = await mailer.sendMail(
          verifyToken,
          req.body.email,
          req.headers.host,
          'imps/verify'
        );
    
        if (sentMail) {
          await user.save();
          res.header('x-auth-token', token).send({
            success: true,
            message: 'Sign up successful'
          });
        } else {
          res.status(400).send({
            success: false,
            message: 'Unable to sign up'
          });
        }
      } catch (error) {
        //console.log(error);
        log.error(error);
        return res.status(400).send({
          success: false,
          message: 'Uable to sign you up'
        });
      }
})

router.post(
    '/login',[impsMiddleware.doNotShowRegisterPage,impsMiddleware.isVerified],
    async (req, res) => {
      try {
        if (!req.body.email || !req.body.password) throw 'error';
  
        var findUser = await impsUser.findOne({
          email: sanitizer.escape(req.body.email)
        });
        if (!findUser) {
          return res.status(400).send({
            success: false,
            message: 'Invalid email or passwrod'
          });
        }
  
        var newUser = impsUser();
        if (
          !newUser.validPassword(
            sanitizer.escape(req.body.password),
            findUser.password
          )
        ) {
          return res.status(400).send({
            success: false,
            message: 'Invalid email or passwrod'
          });
        }
        const token = newUser.generateAuthToken(req.body.email);
        req.session.secure = findUser.secureSessionID;
        //console.log(req.session.secure)
        return res
          .header('x-auth-token', token)
          .status(200)
          .send({
            success: true,
            message: 'logged in'
          });
      } catch (error) {
        log.error(error);
        return res.status(400).send({
          success: false,
          message: 'Opps! something went wrong'
        });
      }
    }
  );
  
  router.get('/logout',impsMiddleware.isLoggedIn,async (req, res) => {
    req.session.secure = undefined;
    res
      .header('x-auth-token', null)
      .status(200)
      .send({
        success: 'Logged out'
      });
  });
  
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
  router.get("/dashboard",[impsMiddleware.isLoggedIn,impsMiddleware.isVerified,impsMiddleware.isSlected],(req,res)=>{
    return res.status(200).send({success: true, message: "You have been selected you can pay now..."})
  })
  
  router.get('/verify/:token',(req, res) => {
    impsUser.findOne({
      resetPasswordToken: req.params.token
      //resetPasswordExpires: { $gt: Date.now() }
    })
      .then(
        m => {
          (m.resetPasswordToken = undefined),
            //m.resetPasswordExpires= undefined,
            (m.isEmailVerified = 1);
          m.save();
          //console.log(m);
          res.status(200).send({
            success: 'Email Verified'
          });
        },
        e => {
          //console.log(e);
          log.error(e);
          res.status(400).send({
            error: 'Verification token is invalid or has expired.'
          });
        }
      )
      .catch(e => {
        //console.log(e);
        log.error(e);
        res.status(400).send({
          error: 'Verification token is invalid or has expired.'
        });
      });
  });
  





module.exports = router;