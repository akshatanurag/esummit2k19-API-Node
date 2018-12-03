const express = require('express');
const crypto = require('crypto-js')
const santizer = require('sanitizer');
const middleware = require('../middleware/middleware')

const {
    admin,
    validateSchema
} = require('../models/admin')

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
            return res.status(400).send({
                success: false,
                message: "Invalid email or password"
            });
        }
        var newAdmin = admin()

        const token = await newAdmin.generateAuthToken(santizer.escape(req.body.email))
        req.session.secure = findAdmin._id
        return res.header('x-auth-token', token).status(200).send({
            success: true,
            message: "logged in"
        });
    } catch (e) {
        return res.status(500).send({
            success: false,
            message: "Opps! Something went wrong"
        })
    }
})

router.get("/logout",middleware.isAdminLoggedIn,(req, res) => {
    try {
        req.session.secure = null;
        return res.status(200).header('x-auth-token', null).send({success: true,message: "Logged out!"})
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Opps!Something went wrong"
        })
    }

})

module.exports = router;