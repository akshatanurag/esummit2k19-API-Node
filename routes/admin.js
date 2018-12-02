const express = require('express');
const crypto = require('crypto-js')
const santizer = require('sanitizer');
const middleware = require('../middleware/middleware')

const {
    admin,
    validateSchema
} = require('../models/admin')

var router = express.Router();

router.post("/create-admin",middleware.isAdminLoggedIn,async (req, res) => {
    var s_email = santizer.escape(req.body.email)
    var s_password = santizer.escape(req.body.password)
    const {
        error
    } = validateSchema(req.body);
    if (error) return res.status(400).send({
        error: error.details[0].message
    });

    var adminFind = await admin.findOne({
        email: s_email
    }).select("-password")
    if(adminFind)
    return res.status(400).send({error: "Opps! Admin already created"})
    var hashPassword = await crypto.SHA256(s_password).toString()
    var newadmin = new admin({
        email: s_email,
        password: hashPassword
    })
    await newadmin.save()
    return res.status(200).send({
        suceess: "admin was created successfully"
    });
})


router.post("/login", async (req, res) => {
    var s_email = santizer.escape(req.body.email)
    var s_password = santizer.escape(req.body.password)
    var hashPassword = await crypto.SHA256(s_password).toString()
    // console.log(hashPassword);
    var findAdmin = await admin.findOne({
        email: s_email,
        password: hashPassword
    })
    if (!findAdmin) {
        return res.status(400).send({
            error: "Invalid email or password"
        });
    }
    var newAdmin = admin()

    const token = await newAdmin.generateAuthToken(s_email)
    req.session.secure = findAdmin._id
    return res.header('x-auth-token', token).status(200).send({
        success: "logged in"
    });
})

router.get("/logout", (req, res) => {
    req.session.secure = null;
    return res.status(200).header('x-auth-token', null).send("logged out")
})

module.exports = router;