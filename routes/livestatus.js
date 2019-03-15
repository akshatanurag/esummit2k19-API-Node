const express = require('express');
const {liveStatus} = require('../models/livestatusModel')
const {User} = require('../models/user')
const {Profile}= require('../models/profile')
const _ = require('lodash');
const middleware = require('../middleware/middleware')

const router = express.Router()

router.post("/get-status",middleware.isAdminLoggedIn,async (req,res)=>{
    let status = await liveStatus.findOne({
        email: req.body.email
    })
    let profile = await Profile.findOne({
        main_email: req.body.email
    })
    let userPaid = await User.findOne({
        email: req.body.email
    }).select("-password")
    if(userPaid.payments.isPaid){
        res.status(200).send({
            success: true,
            status,
            profile
        });
    }else{
        res.status(400).send({
            success: false,
            message: "Unpaid user"
        })  
    }
})

router.post("/update-status",middleware.isAdminLoggedIn,async (req,res)=>{
    try {
        let user = await User.findOne({
            email: req.body.email
        }).select("-password")
        //console.log(user);
        var liveStatusObj = new liveStatus(_.pick(req.body, [
            'email',
            'idIssued',
            'opening',
            'td1',
            'clash',
            'wolf',
            'dinnerD1',
            'td2',
            'td3',
            'td4',
            'icamp',
            'closing',
            'dinnerD2',
            'youtube',
            'bplan'
        ]))
        let userInLive = await liveStatus.findOne({email: req.body.email})
        if(userInLive && user.payments.isPaid){
            update = await liveStatus.findOneAndUpdate({ email: liveStatusObj.email},{
                email: liveStatusObj.email,
                idIssued: liveStatusObj.idIssued,
                opening: liveStatusObj.opening,
                td1: liveStatusObj.td1,
                td3: liveStatusObj.td3,
                td4: liveStatusObj.td4,
                clash: liveStatusObj.clash,
                wolf: liveStatusObj.wolf,
                dinnerD1: liveStatusObj.dinnerD1,
                td2: liveStatusObj.td2,
                icamp: liveStatusObj.icamp,
                closing: liveStatusObj.closing,
                dinnerD2:  liveStatusObj.dinnerD2,
                youtube:  liveStatusObj.youtube,
                bplan: liveStatusObj.bplan
    
            })
            if(update){
                await res.status(200).send({
                    success: true,
                    message: "Status updated successfully"
                })
            }

        }
        //console.log("sdjkchdsc");
        else if(user.payments.isPaid){
            //console.log("here")
            if(user.payments.isPaid){
                await liveStatusObj.save()
                await res.status(200).send({
                    success: true,
                    message: "Status updated successfully"
                })
            } else{
                await res.status(400).send({
                    success: true,
                    message: "User not registered or not paid"
                })
            }

            }
            else{
                res.status(400).send({
                    success: false,
                    message: "Not Paid"
                })
            }
     
        //liveStatusObj.email = req.user.email
        // if(user){
        //     await liveStatusObj.save()
        //     await res.status(200).send({
        //         success: true,
        //         message: "Status updated successfully"
        //     })
        // } else{
        //     await res.status(400).send({
        //         success: true,
        //         message: "User not registered"
        //     })
        // }
    
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "error"
        })
    }
    

})

module.exports = router;