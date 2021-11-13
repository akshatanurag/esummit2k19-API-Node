/*
    The page does not have santizer in it. Will ad it later too much work now!!1

*/

const express = require('express');
const _ = require('lodash');
var randomstring = require('randomstring');
const {
  Profile,
  validate
} = require('../models/profile');
const {
  User
} = require('../models/user');
const middleware = require('../middleware/middleware');
const log = require('../config/bunyan-config');
const router = express.Router();
const mailer = require('../config/sendgrid-mail');
const sanitizer = require('sanitizer');


router.get(
  "/profile",
  [middleware.isLoggedIn, middleware.isVerified, middleware.isFromKiit],
  async (req, res) => {
    try {
      let findProfile = await Profile.findOne({
        main_email: req.user.email,
      });
      if (!findProfile)
        return res.status(200).json({
          success: false,
          message: "Profile Not Complete",
        });

      return res.status(200).json({
        success: true,
        message: {
          ...findProfile._doc,
          paymentStatus: req.user.payments.isPaid,
        },
      });
    } catch (error) {}
  }
);

router.post(
  "/profile",
  [middleware.isLoggedIn, middleware.isVerified, middleware.isFromKiit],
  async (req, res) => {
    try {
      console.log(req.body);

      // Refactor isProfileComplete Middileware we can use that here.
      let findProfile = await Profile.findOne({
        main_email: req.user.email,
      });

      //   Already filled profile.
      if (findProfile)
        return res.status(400).send({
          success: false,
          message: "Opps!Looks like you have already done that",
        });
      //console.log(findUser._id)

      const { error } = validate(req.body);
      if (error)
        return res.status(400).send({
          success: false,
          message: error.details[0].message,
        });

      // Sanatize all the values coming in lodash.
      // All the values types are

      //console.log('In profile route');

      let profileObj = _.pick(req.body, [
        "fullName",
        "alt_email",
        "mob_no",
        "w_mob_no",
        "roll",
        "uni",
        "gender",
        "year",
      ]);

      Object.keys(profileObj).forEach((props) => {
        if (
          typeof profileObj[props] == "string" &&
          profileObj[props] !== null
        ) {
          profileObj[props] = sanitizer.escape(profileObj[props]);
        }
      });

      let profile = new Profile(profileObj);
      //console.log('*******', profile);

      /**
       * Things we are checking unique in
       * Profile db.
       *
       * alt_email
       * mob_no
       * whatsapp_no
       * rollno
       *
       **/

      const checkUnique = await Profile.find({
        $or: [
          {
            mob_no: profile.mob_no,
          },
          {
            w_mob_no: profile.w_mob_no,
          },
        ],
      });
      //console.log(checkUnique.length)

      if (checkUnique != 0) {
        return res.status(400).send({
          success: false,
          message: "Looks like you have already done that.",
        });
      }
      // Values lying under this are true

      if (
        profile.gender == "M" ||
        profile.gender == "F" ||
        profile.gender == "O"
      ) {
        profile.main_email = sanitizer.escape(req.user.email);
        profile.user_id = sanitizer.escape(req.user._id);

        //capitalization => Makes it to lower case.
        let randString = await randomstring.generate({
          length: 4,
          charset: "alphanumeric",
          capitalization: "uppercase",
        });

        // console.log('For ProfileDB + ', randString);
        profile.es_id = `ES_${randString}`;
        profile.profileComplete = true;

        //Fix needed
        // Send mail to kiit student
        if (profile.uni == "kiit university") {
          if (req.kiit) {
            let verifyToken = randomstring.generate({
              length: 50,
              charset: "hex",
            });
            profile.kiitMailVerifyToken = verifyToken;
            // let sentMail = await mailer.sendMail(
            //   verifyToken,
            //   profile.alt_email,
            //   req.headers.host,
            //   'kiit-id-verify'
            // );

            // if (!sentMail) {
            //   throw 'Mail Not sent';
            // } else {
            await profile.save();
            return res.status(200).send({
              success: true,
              message: "Profile has been saved",
            });
            // }
          } else {
            return res.status(400).send({
              success: false,
              message: "Incorrect KIIT mail id",
            });
          }
        } else {
          await profile.save();
          return res.status(200).send({
            success: true,
            message: "Profile has been saved",
          });
        }
      }
      // Some bad value were filled.
      else {
        return res.status(400).send({
          success: false,
          message: "Some wrong values were sent",
        });
      }
    } catch (error) {
      log.error(error);
      return res.status(400).send({
        success: false,
        message: `Opps! Something went wrong ${error}`,
      });
    }
  }
);


// router.get("/kiit-id-verify/:token",async (req,res)=>{
//   if(profileData = await Profile.findOne({
//     kiitMailVerifyToken: req.params.token
//   }))
//   {
//     profileData.kiitMailVerifyToken = undefined;
//     profileData.kiitMailVerfyStatus = true;
//     await profileData.save()
//     return res.status(200).send({success: true, message: "KIIT Mail verification successful"})
//   }
//   else{
//     return res.status(400).send({success: false, message: "Verification token is invalid or has expired."})
//   }
// })

module.exports = router;



// Got the problem....
// Let me fix this

//okay
// also middleware will only work for kiit students. So i am doing that