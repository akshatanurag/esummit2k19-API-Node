const jwt = require('jsonwebtoken');
const config = require('config');
const { impsUser } = require('../models/imps_user');

const sanitizer = require('sanitizer');
const log = require('../config/bunyan-config');

const fetchUser = async email => {
  var findUser = await impsUser.findOne({
    email: email
  }).select('-password');
  if (!findUser) return 0;
  return findUser;
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
      req.impsUser = decoded;
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
      if (req.impsUser) var email = req.impsUser.email;
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
    doNotShowRegisterPage: function(req, res, next) {
        if (!req.header('x-auth-token') && !req.session.secure) next();
        else
          return res.status(400).send({
            succes: false,
            message: 'You are already loggedin. Kindly log out first'
          });
      },
    isSlected: async function(req,res,next){
        try {
            var findUser = await fetchUser(req.impsUser.email)
            if(!findUser)
            return res.status(400).send({succes: false, message: "Your startup is not registered"})
    
            if(findUser.slected)
            next();
            else
            return res.status(400).send({succes: false, message: "You can only access your dashboard once you are selcted. Kindly wait for our email"})
        } catch (error) {
            return res.status(400).send({succes: false, message: "Opps! something went wrong."})
        }


    }
}