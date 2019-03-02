const express = require('express');
const _ = require('lodash');
const router = express.Router();
var randomstring = require('randomstring');
const sanitizer = require('sanitizer');
const campuspreneur_mail = require('../config/campuspreneur_mail');

const {Campusperneur, validate} = require('../models/campus-rep');

router.post("/register",async(req,res)=>{
    try {
        const {
            error
          } = validate(req.body);
          if (error)
            return res.status(400).send({
              success: false,
              message: error.details[0].message
        });
        let profileObj = _.pick(req.body, ['name', 'email','mob_no','w_mob_no','roll','year','gender']);
        Object.keys(profileObj).forEach(props => {
            if (
              typeof profileObj[props] == 'string' &&
              profileObj[props] !== null
            ) {
              profileObj[props] = sanitizer.escape(profileObj[props]);
            }
          });
        var campuspreneur = new Campusperneur(profileObj)
        const checkUnique = await Campusperneur.find({
            $or: [{
                email: campuspreneur.email
              },
              {
                mob_no: campuspreneur.mob_no
              },
              {
                w_mob_no: campuspreneur.w_mob_no
              },
              {
                roll: campuspreneur.roll
              }
            ]
          });
          //console.log(checkUnique.length)
    
          if (checkUnique != 0) {
            return res.status(400).send({
              success: false,
              message: 'Already Registered!'
            });
          }
          if ((campuspreneur.gender == 'M' ||
          campuspreneur.gender == 'F' ||
          campuspreneur.gender == 'O')){

                let randString = await randomstring.generate({
                    length: 5,
                    charset: 'alphanumeric',
                    capitalization: 'uppercase'
                  });
                  campuspreneur.camp_id = randString
                  let sentMail = await campuspreneur_mail.sendMail(
                    campuspreneur.email,
                    randString
                  );
                  
                  if (!sentMail) {
                    throw 'Mail Not sent';
                  } else {
                    await campuspreneur.save();
                    return res.status(200).send({
                      success: true,
                      message: 'Registration Was successful',
                      ref_id: campuspreneur.camp_id
                    });
                  }
          } else{
            return res.status(400).send({
                success: false,
                message: "Gender wrong"
            })
          }

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: "Opps! Something went wrong"
        })
    }


})
module.exports = router;

