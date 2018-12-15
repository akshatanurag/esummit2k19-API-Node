const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../models/user');
const { Profile } = require('../models/profile');
const { admin } = require('../models/admin');
const sanitizer = require('sanitizer');
const log = require('../config/bunyan-config');

const seatInfo = require('../models/allSeats');

const fetchUser = async email => {
  var findUser = await User.findOne({
    email: email
  }).select('-password');
  if (!findUser) return 0;
  return findUser;
};

const fectchSeatInfo = async id => {
  var findSeatInfo = await seatInfo.findOne({
    name: id
  });
  if (!findSeatInfo) return 0;
  return findSeatInfo;
};
module.exports = {
  isLoggedIn: async function(req, res, next) {
    try {
      const token = req.header('x-auth-token');
      if (!token && !req.session.secure)
        return res.status(401).send({
          success: false,
          message: 'Access denied'
        });
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
      req.user = decoded;
      var currentUser = await fetchUser(decoded.email);
      if (
        req.session.secure &&
        currentUser.secureSessionID &&
        req.session.secure == currentUser.secureSessionID
      )
        next();
      else
        return res.status(401).send({
          success: false,
          message: 'Invalid Session or token'
        });

      //next();
    } catch (e) {
      log.error('Generated from isLoggedIn Middileware' + e);
      return res.status(401).send({
        success: false,
        message: 'Access denied'
      });
    }
  },
  isVerified: async function(req, res, next) {
    try {
      if (req.user) var email = req.user.email;
      else var email = sanitizer.escape(req.body.email);
      var currentUser = await fetchUser(email);
      if (currentUser == 0)
        return res.status(400).send({
          success: false,
          message: 'No user was found'
        });
      if (currentUser.isEmailVerified == 1) next();
      else
        return res.status(401).send({
          success: false,
          message: 'Email not verified'
        });
    } catch (e) {
      log.error(e);
      return res.status(401).send({
        success: false,
        message: 'Email not verified'
      });
    }
  },
  isProfileComplete: async function(req, res, next) {
    try {
      var findProfile = await Profile.findOne({
        main_email: req.user.email
      });
      if (!findProfile)
        return res.status(400).send({
          success: false,
          message: 'Profile was not completed'
        });
      if (findProfile.profileComplete) next();
      else
        return res.status(400).send({
          success: false,
          message: 'Profile not completed yet'
        });
    } catch (e) {
      log.error(e);
      return res.status(400).send({
        success: false,
        message: 'Profile not completed yet'
      });
    }
  },
  isPaid: async function(req, res, next) {
    try {
      var currentUser = await fetchUser(req.user.email);
      if (currentUser == 0)
        return res.status(400).send({
          success: false,
          message: 'No user was found'
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
          success: false,
          message: 'You need to pay first'
        });
    } catch (e) {
      log.error(e);
      return res.status(401).send({
        success: false,
        message: 'You need to pay first'
      });
    }
  },
  isSeatLeft: async function(req, res, next) {
    try {
      var currentUser = await fetchUser(req.user.email);
      if (currentUser.uni == 'kiit university') {
        var seatStatus = await fectchSeatInfo('All Seats');
        if (seatStatus != 0 && seatStatus.seats > 0) next();
        else
          return res.status(401).send({
            success: false,
            message: 'Sorry! we are full'
          });
      } else {
        var seatStatus = await fectchSeatInfo('All Seats');
        if (seatStatus != 0 && seatStatus.r_seats > 0) next();
        else
          return res.status(401).send({
            success: false,
            message: 'Sorry! we are full'
          });
      }
    } catch (e) {
      log.error(e);
      return res.status(401).send({
        success: false,
        message: 'Sorry! we are full'
      });
    }
  },
  hasSeat: async function(req, res, next) {
    try {
      var userProfile = await Profile.findOne({
        main_email: req.user.email
      });
      if (!userProfile)
        return res.status(400).send({
          success: false,
          message: 'No user was found'
        });
      if (userProfile.seatSafe) next();
      else
        return res.status(400).send({
          success: false,
          message: 'Visit dashboard before choosing events'
        });
    } catch (e) {
      log.error(e);
      return res.status(400).send({
        success: false,
        message: 'Visit dashboard before choosing events'
      });
    }
  },
  hasSelectedTwoEvents: async function(req, res, next) {
    try {
      var userProfile = await Profile.findOne({
        main_email: req.user.email
      });
      if (!userProfile)
        return res
          .status(400)
          .send({ success: false, message: 'No user profile was found' });
      // console.log(userProfile.selectedTwoEvents)
      // console.log(userProfile.eventsChosen.length)
      if (
        userProfile.selectedTwoEvents == false &&
        userProfile.eventsChosen.length < 4
      )
        next();
      else
        return res
          .status(400)
          .send({ success: false, message: 'Done that already? ' });
    } catch (e) {
      log.error(e);
      return res
        .status(400)
        .send({ success: false, message: 'Done that already? ' });
    }
  },
  isAdminLoggedIn: async function(req, res, next) {
    try {
      const token = req.header('x-auth-token');
      if (!token && !req.session.secure)
        return res
          .status(401)
          .send({ success: false, message: 'Access denied' });
      const decoded = await jwt.verify(token, config.get('jwtPrivateKey'));
      // console.log(decoded.email);
      req.user = decoded;
      var adminFind = await admin
        .findOne({
          email: decoded.email
        })
        .select('-password');
      if (adminFind && req.session.secure == adminFind._id && decoded.isAdmin)
        next();
      else
        return res
          .status(401)
          .send({ success: false, message: 'Not authorized' });
    } catch (e) {
      log.error(e);
      return res
        .status(401)
        .send({ success: false, message: 'Not authorized' });
    }
  },
  doNotShowRegisterPage: function(req, res, next) {
    if (!req.header('x-auth-token') && !req.session.secure) next();
    else
      return res.status(400).send({
        succes: false,
        message: 'You are already loggedin. Kindly log out first'
      });
  },

  /**
   *  isFromKIIT => Checks person is from KIIT or not
   * if he/she is then marks true to req.kiit else false.
   *
   * **/

  isFromKiit: function(req, res, next) {
    const kiitSet = new Set([
      'kiit.ac.in',
      'medical.ac.in',
      'biotech.ac.in',
      'law.ac.in'
    ]);


    let email = null;
    // Only If email is there...
   // console.log(req.body.alt_email);
    if (req.body.alt_email) {
      email = req.body.alt_email.split('@')[1];
    }

    if (kiitSet.has(email)) {
      req.kiit = true;
    } else {
      req.kiit = false;
    }

    next();
  },
  isKiitStudent: async function(req,res,next){
    try {
      let userProfile = await Profile.findOne({
        main_email: req.user.email
      })
      if(!userProfile)
      return res.status(400).send({succes: false, message: "Profile not complete"})
  
      if(userProfile.uni == 'kiit university' && userProfile.kiitMailVerfyStatus)
      next();
      else if(userProfile.uni !== 'kiit university' && userProfile.kiitMailVerfyStatus == false)
      next()
      else
      return res.status(400).send({succes: false, message: "If you are from KIIT then, please verify your kiit mail first. Or contact us at techies@ecell.org.in"})
    } catch (error) {
      return res.status(400).send({succes: false, message: "Opps! Something went wrong..."})
    }

  }
};
