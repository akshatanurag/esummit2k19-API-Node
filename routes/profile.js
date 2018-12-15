/*
    The page does not have santizer in it. Will ad it later too much work now!!1

*/

const express = require('express');
const _ = require('lodash');
var randomstring = require('randomstring');
const { Profile, validate } = require('../models/profile');
const { User } = require('../models/user');
const middleware = require('../middleware/middleware');
const log = require('../config/bunyan-config');
const router = express.Router();
const mailer = require('../config/sendgrid-mail');
const sanitizer = require('sanitizer');

router.post(
  '/profile',
  [middleware.isLoggedIn, middleware.isVerified, middleware.isFromKiit],
  async (req, res) => {
    try {
      let findUser = await User.findOne({
        email: sanitizer.escape(req.user.email)
      })
        .select('-password')
        .select('-secureSessionID');
      console.log(findUser)

      if (!findUser)
        return res.status(400).send({
          success: false,
          message: "Looks like you haven't signed up yet!"
        });

      // Refactor isProfileComplete Middileware we can use that here.
      let findProfile = await Profile.findOne({
        user_id: findUser._id
      });

      //   Already filled profile.
      if (findProfile)
        return res.status(400).send({
          success: false,
          message: 'Opps!Looks like you have already done that'
        });
      //console.log(findUser._id)

      const { error } = validate(req.body);
      if (error)
        return res.status(400).send({
          success: false,
          message: error.details[0].message
        });

       console.log('In profile route');
        
        let profileObj = _.pick(req.body, [
          'fullName',
          'alt_email',
          'mob_no',
          'w_mob_no',
          'roll',
          'uni',
          'gender',
          'year'
        ]);

        
        console.log(profileObj);
        // Sanatize all the values coming in lodash.
        // All the values types are
        //wait some issues
        // okay 
        //
          
        

        Object.keys(profileObj).forEach(props => {
          if (
            typeof profileObj[props] == 'string' &&
            profileObj[props] !== null
          ) {
            console.log(props);
            profileObj[props] = sanitizer.escape(profileObj[props]);
          }
        });
  
        let profile = new Profile(profileObj);
        console.log(profile); //not working...

        //aap isko fix karke git pe push karo codealine ka kaam hai thora abhi... /////
        //okay
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
          { alt_email: profile.alt_email },
          { mob_no: profile.mob_no },
          { roll: profile.roll },
          { w_mob_no: profile.w_mob_no }
        ]
      });

      if (checkUnique) {
        return res.status(400).send({
          success: false,
          message: 'Duplicate Values sent...'
        });
      }
      // Values lying under this are true

      if (
        (profile.gender == 'M' ||
          profile.gender == 'F' ||
          profile.gender == 'O') &&
        profile.year < 5
      ) {
        profile.main_email = sanitizer.escape(findUser.email);
        profile.user_id = sanitizer.escape(findUser._id);

        //capitalization => Makes it to lower case.
        let randString = await randomstring.generate({
          length: 4,
          charset: 'alphanumeric',
          capitalization: 'uppercase'
        });

        // console.log('For ProfileDB + ', randString);
        profile.es_id = `ES_${randString}`;
        profile.profileComplete = true;

        
        // Send mail to kiit student
        if(profile.uni == "kiit university"){
        if (req.kiit) {
          let verifyToken = randomstring.generate({
            length: 50,
            charset: 'hex'
          });

          let sentMail = await mailer.sendMail(
            verifyToken,
            profile.email,
            req.headers.host,
            'verify'
          );

          if (!sentMail) {
            throw 'Mail Not sent';
          }
        }

        await profile.save();
      }
        else{
          await profile.save();
        }

        return res.status(200).send({
          success: true,
          message: 'Profile has been saved'
        });
      }
      // Some bad value were filled.
      else {
        return res.status(400).send({
          success: false,
          message: 'Some wrong values were sent'
        });
      }
    } catch (error) {
      log.error(error);
      return res.status(400).send({
        success: false,
        message: 'Opps! Something went wrong'
      });
    }
  }
);

module.exports = router;



// Got the problem....
// Let me fix this

//okay
// also middleware will only work for kiit students. So i am doing that