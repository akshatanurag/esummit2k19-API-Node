const express = require('express');
const requestIp = require('request-ip');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();

const ipMiddleware = function(req, res) {
    const clientIp = requestIp.getClientIp(req);
     console.log(clientIp)
};

router.get("/", (req, res) => {
    ipMiddleware(req,res);
    return res.send({
        esummit_api: "v 1.0"
    })
})




router.get("/dxuth",(req,res)=>{
    const token = req.header('token');
    if (!token)
      return res.status(401).send({
        success: false,
        message: 'Access denied'
      });
      //console.log(token)
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    // req.user = decoded;
    // var currentUser = await fetchUser(decoded.email);
    res.status(200).send(decoded)
})

module.exports = router;