const express = require('express');
const requestIp = require('request-ip');

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


module.exports = router;