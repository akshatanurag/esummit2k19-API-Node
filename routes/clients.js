const express = require('express');
const jwt = require('jsonwebtoken')
const config = require('config');

var router = express.Router()

genAPIToken = async (username) => {
    return jwt.sign({
        device: username
    }, config.get("jwtPrivateKey"), {
        expiresIn: "24h"
    })
}


router.get("/get-token", async (req, res) => {
    if (req.header("username") == "android" && req.header("password") == "123456")
        res.status(200).header("x-api-token", await genAPIToken("Android")).send({
            success: true
        })
    else if (req.header("username") == "angular" && req.header("password") == "abcdef")
        res.status(200).header("x-api-token", await genAPIToken("Angular")).send({
            success: true
        })
    else
        res.status(400).send({
            success: false,
            message: "Unauthorized"
        })
})

module.exports = router