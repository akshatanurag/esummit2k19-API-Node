const express = require('express');
const {liveStatus} = require('../models/livestatusModel')
const {User} = require('../models/user')
const _ = require('lodash');
const middleware = require('../middleware/middleware')

const router = express.Router()

router.post("/get-status",async (req,res)=>{
    let status = await liveStatus.findOne({
        email: req.body.email
    })
    if(status){
        res.status(200).send({
            success: true,
            status
        }) 
    }else{
        res.status(400).send({
            success: false
        })  
    }
})

router.post("/update-status",middleware.isAdminLoggedIn,async (req,res)=>{
    let user = await User.findOne({
        email: req.body.email
    })
    var liveStatusObj = new liveStatus(_.pick(req.body, [
        'email',
        'idIssued',
        'opening',
        'td1',
        'clash',
        'wolf',
        'dinnerD1',
        'td2',
        'icamp',
        'closing',
        'dinnerD2'
    ]))
    //liveStatusObj.email = req.user.email
    if(user){
        await liveStatusObj.save()
        await res.status(200).send({
            success: true,
            message: "Status updated successfully"
        })
    } else{
        await res.status(400).send({
            success: true,
            message: "User not registered"
        })
    }


})

module.exports = router;