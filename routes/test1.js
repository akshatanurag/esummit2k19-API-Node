const express = require('express');
const { User } = require('../models/user');

const router = express.Router()

router.get("/test1",async (req,res)=>{
    let paid = 0;
    let userData = await User.find()
    // console.log(userData.length)
    await userData.forEach(element => {
        if(element.payments.isPaid){
            paid++;
        }
    });
    res.status(200).send({
        paid_count: paid-2,
        unpaid_count: userData.length - (paid-2),
        total: userData.length
    })
})
/**
 * Left to add
 * 
 * 1. Show a list of all paid and unpaid participants
 * 
 */
module.exports = router;

