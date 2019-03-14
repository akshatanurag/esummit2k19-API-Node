const express = require('express');
const {liveStatus} = require('../models/livestatusModel')
const {User} = require('../models/user')
const _ = require('lodash');
const middleware = require('../middleware/middleware')

const router = express.Router()

router.post("/get-status",middleware.isAdminLoggedIn,async (req,res)=>{
    let status = await liveStatus.find({
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
    let user = await User.find({
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
    let userInLive = await liveStatus.find({email: req.body.email})
    if(!userInLive){

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
    }

    else{
        update = await liveStatus.findOneAndUpdate({ email: liveStatusObj.email},{
            email: liveStatusObj.email,
            idIssued: liveStatusObj.idIssued,
            opening: liveStatusObj.opening,
            td1: liveStatusObj.td1,
            clash: liveStatusObj.clash,
            wolf: liveStatusObj.wolf,
            dinnerD1: liveStatusObj.dinnerD1,
            td2: liveStatusObj.td2,
            icamp: liveStatusObj.icamp,
            closing: liveStatusObj.closing,
            dinnerD2:  liveStatusObj.dinnerD2
        })
        if(update){
            await res.status(200).send({
                success: true,
                message: "Status updated successfully"
            })
        }

    }
 
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