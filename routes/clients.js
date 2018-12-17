const express = require('express');
const jwt = require('jsonwebtoken')
const config = require('config');
const request = require('request');
const url = require('url')

var router = express.Router()
const {
    User
} = require('../models/user');
const {
    Profile
} = require('../models/profile');
const log = require('../config/bunyan-config')

genAPIToken = async (username) => {
    return jwt.sign({
        device: username
    }, config.get("jwtPrivateKey"), {
        expiresIn: "24h"
    })
}


router.get("/api/get-token", async (req, res) => {
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

/*AUTH.js email verify */
router.get('/verify/:token', (req, res) => {
    User.findOne({
            resetPasswordToken: req.params.token
            //resetPasswordExpires: { $gt: Date.now() }
        }).select("-password").select("-secureSessionId")
        .then(
            m => {
                (m.resetPasswordToken = undefined),
                //m.resetPasswordExpires= undefined,
                (m.isEmailVerified = 1);
                m.save();
                //console.log(m);
                res.status(200).render("emailverify")
            },
            e => {
                //console.log(e);
                log.error(e);
                res.status(400).render("emainVerifyError")
            }
        )
        .catch(e => {
            //console.log(e);
            log.error(e);
            res.status(400).render("emainVerifyError")
        });
});

/* forgot.js*/
/*router.get("/reset/:token", async (req, res) => { //render the form here to get the new password
    try {
        var findUserByToken = await User.findOne({
            resetEmailToken: req.params.token,
            resetEmailExpires: {
                $gt: Date.now()
            }
        }).select('-password').select('-secureSessionID');
        if (!findUserByToken)
            return res.status(400).send({
                success: false,
                message: "Reset token is invalid or has expired."
            });
        if (findUserByToken.resetEmailToken == req.params.token) {
            return res.status(200).send({
                success: true,
                message: "Enter new password by sending post request on this exact route"
            })
            //render reset form here
        } else {
            return res.status(400).send({
                success: false,
                message: "Reset token is invalid or has expired."
            });
        }
    } catch (error) {
        log.error(error)
        return res.status(400).send({
            success: false,
            message: "Reset token is invalid or has expired."
        })
    }

})

router.post("/reset/:token", async (req, res) => {
    try {
        var findUserByToken = await User.findOne({
            resetEmailToken: req.params.token,
            resetEmailExpires: {
                $gt: Date.now()
            }
        }).select('-password').select('-secureSessionID');
        if (!findUserByToken)
            return res.status(400).send({
                success: false,
                message: "Reset token is invalid or has expired."
            });
        if (findUserByToken.resetEmailToken == req.params.token) {
            //return res.status(200).send({success: "Enter new email by sending post request on /reset/:token"})
            if (!req.body.password)
                return res.status(400).send({
                    success: false,
                    message: "Password not enterd"
                })
            var passStrength = owasp.test(req.body.password)
            if (passStrength.errors.length > 0)
                return res.status(400).send({
                    errors: passStrength.errors
                });
            findUserByToken.password = await bcrypt.hashSync(sanitizer.escape(req.body.password), bcrypt.genSaltSync(10), null);
            findUserByToken.resetEmailToken = undefined;
            findUserByToken.resetEmailExpires = undefined
            await findUserByToken.save()
            return res.status(200).send({
                success: true,
                message: 'Password reset successful'
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "Reset token is invalid or has expired."
            });
        }
    } catch (error) {
        log.error(error);
        return res.status(400).send({
            success: false,
            message: "Reset token is invalid or has expired."
        });
    }

})
*/

/* payments.js */

/*router.get("/thankyou", async (req, res) => {
    try {
        var headers = {
            'X-Api-Key': 'test_c10c242d09fa6d2792deed0c82a',
            'X-Auth-Token': 'test_984665af47a659c0a4af0eef5a2'
        }
        var q = url.parse(req.url, true);
        if (!q.query.payment_request_id || !q.query.payment_id) {
            return res.status(404).send({
                success: false,
                error: "The page was not found"
            });
        }

        request.get(`https://test.instamojo.com/api/1.1/payment-requests/${q.query.payment_request_id}/`, {
            headers: headers
        }, async function (error, response, body) {
            if (!error && response.statusCode == 200) {
                obj = JSON.parse(body)
                //console.log(obj.payment_request.payments[0]);
                if (obj.payment_request.payments[0].status == 'Credit') {
                    var findUser = await User.findOne({
                        email: obj.payment_request.email
                    }).select('-password').select('-secureSessionID');
                    if (!findUser)
                        return res.status(400).send({
                            error: "User not registred"
                        })

                    findUser.payments.isPaid = true;
                    findUser.payments.payment_id = obj.payment_request.id
                    findUser.payments.instamojo_id = obj.payment_request.payments[0].payment_id
                    await findUser.save();

                    //success
                    return res.status(200).send({
                        success: true,
                        message: "Payment was successfull",

                    });
                }
            } else {
                return res.status(400).send({
                    error: "Opps! Something went wrong"
                })
            }
        })
    } catch (error) {
        log.error(error);
        return res.status(400).send({
            success: false,
            message: "Opps! Something went wrong"
        })
    }


})


router.get("/kiit-id-verify/:token", async (req, res) => {
    if (profileData = await Profile.findOne({
            kiitMailVerifyToken: req.params.token
        })) {
        profileData.kiitMailVerifyToken = undefined;
        profileData.kiitMailVerfyStatus = true;
        await profileData.save()
        return res.status(200).send({
            success: true,
            message: "KIIT Mail verification successful"
        })
    } else {
        return res.status(400).send({
            success: false,
            message: "Verification token is invalid or has expired."
        })
    }
})*/



module.exports = router