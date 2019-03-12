const express = require('express');
const crypto = require('crypto-js')
const santizer = require('sanitizer');
const middleware = require('../middleware/middleware')
const log = require('../config/bunyan-config')

const {
    admin,
    validateSchema
} = require('../models/admin')

const {Profile} = require('../models/profile')

var router = express.Router();

router.post("/create-admin", middleware.isAdminLoggedIn, async (req, res) => {
    try {
        const {
            error
        } = validateSchema(req.body);
        if (error) return res.status(400).send({
            success: false,
            message: error.details[0].message
        });

        var adminFind = await admin.findOne({
            email: santizer.escape(req.body.email)
        }).select("-password").select('-secureSessionID')
        if (adminFind)
            return res.status(400).send({
                success: false,
                message: "Opps! Admin already created"
            })
        var hashPassword = await crypto.SHA256(santizer.escape(req.body.password)).toString()
        var newadmin = new admin({
            email: santizer.escape(req.body.email),
            password: hashPassword
        })
        await newadmin.save()
        return res.status(200).send({
            suceess: true,
            message: "admin was created successfully"
        });
    } catch (e) {
        log.error(e);
        return res.status(500).send({
            success: false,
            message: "Opps! Something went wrong"
        })
    }
})


router.post("/login", async (req, res) => {
    try {
        if(!req.body.password || !req.body.email)
        throw "error";
        var hashPassword = await crypto.SHA256(santizer.escape(req.body.password)).toString()
        // console.log(hashPassword);
        var findAdmin = await admin.findOne({
            email: santizer.escape(req.body.email),
            password: hashPassword
        })
        if (!findAdmin) {
            console.log("here");
            return res.status(400).send({
                success: false,
                message: "Invalid email or password"
            });
        }
        var newAdmin = admin()

        const token = await newAdmin.generateAuthToken(santizer.escape(req.body.email))
        //req.session.secure = findAdmin._id
        return res.header('x-auth-token', token).status(200).send({
            success: true,
            message: "logged in"
        });
    } catch (e) {
        log.error(e);
        return res.status(500).send({
            success: false,
            message: "Opps! Something went wrong"
        })
    }
})

router.post("/get-user",middleware.isAdminLoggedIn,async (req,res)=>{
    let profile = await Profile.findOne({
        main_email: req.body.email
    }).select("-profileComplete").select("-seatSafe").select("-selectedTwoEvents").select("-kiitMailVerfyStatus").select("-isPaid").select("-_id").select("-user_id").select("-kiitMailVerifyToken").select("-__v").select("-teamID").select("-combo_code")

    res.send(profile)
    

})

router.get("/get-user",async (req,res)=>{
    let user = await Profile.find().select("-seatSafe").select("-selectedTwoEvents").select("-kiitMailVerfyStatus").select("-isPaid").select("-_id").select("-user_id").select("-kiitMailVerifyToken").select("-__v").select("-teamID").select("-combo_code").select("-eventsChosen")
    res.send(user)
})

router.post("/issue-id",async (req,res)=>{
    let profile = await Profile.findOneAndUpdate({
        main_email: req.body.email
    },{
        id_issued: 1
    })
    if(profile){
        res.send(true)
    }
})

router.get("/logout",middleware.isAdminLoggedIn,(req, res) => {
    try {
        //req.session.secure = null;
        return res.status(200).header('x-auth-token', null).send({success: true,message: "Logged out!"})
    } catch (error) {
        log.error(error);
        return res.status(500).send({
            success: false,
            message: "Opps!Something went wrong"
        })
    }

})

module.exports = router;