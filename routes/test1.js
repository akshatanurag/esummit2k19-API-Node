const express = require('express');
const { User } = require('../models/user');
const {Profile} = require('../models/profile')

const router = express.Router()

router.get("/test1",async (req,res)=>{
    let paid = 0,combo = 0;
    let userData = await User.find().select("-password")
    // console.log(userData.length)
    await userData.forEach(element => {
        if(element.payments.isPaid){
            paid++;
        } if(element.payments.isPaid && element.combo_code === "COMBO2019")
        {
            combo++;
        }
    });
    res.status(200).send({
        paid_count: paid-2,
        unpaid_count: userData.length - (paid-2),
        total: userData.length,
        combo_paid: combo,
        combo_unpaid: userData.length - combo
    })
})

router.get("/update-kiit",async (req,res)=>{
    // console.log(Profile.length)
    let profile = await Profile.updateMany({
        kiitMailVerfyStatus: false
    },{
        kiitMailVerfyStatus: true
    })
    if(profile)
    console.log("done")
})
/**
 * Left to add
 * 
 * 1. Show a list of all paid and unpaid participants
 * 
 */
module.exports = router;

