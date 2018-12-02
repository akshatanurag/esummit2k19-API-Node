const express = require('express');
const crypto = require('crypto-js')

const middleware = require('../middleware/middleware')

const {
    admin,
    validateSchema
} = require('../models/admin')

var router = express.Router();

router.post("/create-admin",middleware.isAdminLoggedIn,async (req, res) => {
    const {
        error
    } = validateSchema(req.body);
    if (error) return res.status(400).send({
        error: error.details[0].message
    });

    var adminFind = await admin.findOne({
        email: req.body.email
    }).select("-password")
    if(adminFind)
    return res.status(400).send({error: "Opps! Admin already created"})
    var hashPassword = await crypto.SHA256(req.body.password).toString()
    var newadmin = new admin({
        email: req.body.email,
        password: hashPassword
    })
    await newadmin.save()
    return res.status(200).send({
        suceess: "admin was created successfully"
    });
})


router.post("/login", async (req, res) => {


    var hashPassword = await crypto.SHA256(req.body.password).toString()
    console.log(hashPassword);
    var findAdmin = await admin.findOne({
        email: req.body.email,
        password: hashPassword
    })
    if (!findAdmin) {
        return res.status(400).send({
            error: "Invalid email or password"
        });
    }
    var newAdmin = admin()

    const token = await newAdmin.generateAuthToken(req.body.email)
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