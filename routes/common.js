const express = require('express');

const router = express.Router();

router.get("/", (req, res) => {
    res.send({
        esummit_api: "v 1.0"
    })
})

module.exports = router;