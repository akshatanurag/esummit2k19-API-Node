const request = require('request');
const express = require('express');
const url = require('url')

const router = express.Router();
const {
    User
} = require('../models/user')
const {
    Profile
} = require('../models/profile')
const middleware = require('../middleware/middleware')




router.get("/pay", [middleware.isLoggedIn, middleware.isProfileComplete, middleware.isVerified, middleware.isSeatLeft], async (req, res) => {
    var findUser = await User.findOne({
        email: req.user.email
    }).select('-password').select('-secureSessionID');
    if (!findUser)
        return res.status(400).send({
            error: "User not registred"
        })

    var findProfile = await (Profile.findOne({
        user_id: findUser._id
    }))
    if (!findProfile)
        return res.status(400).send({
            error: "Profile not registred"
        })


    var headers = {
        'X-Api-Key': 'test_c10c242d09fa6d2792deed0c82a',
        'X-Auth-Token': 'test_984665af47a659c0a4af0eef5a2'
    }
    var payload = {
        purpose: 'E-Sumiit 2019',
        amount: '850',
        phone: findProfile.mob_no,
        buyer_name: findProfile.fullName,
        redirect_url: 'http://localhost:3000/api/thankyou',
        send_email: true,
        webhook: 'http://www.example.com/webhook/',
        send_sms: true,
        email: findUser.email,
        allow_repeated_payments: false
    }

    await request.post('https://test.instamojo.com/api/1.1/payment-requests/', {
        form: payload,
        headers: headers
    }, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            obj = JSON.parse(body)
            res.redirect(obj.payment_request.longurl)
        }
    })
})



router.get("/thankyou", [middleware.isLoggedIn, middleware.isProfileComplete, middleware.isVerified], async (req, res) => {
    var headers = {
        'X-Api-Key': 'test_c10c242d09fa6d2792deed0c82a',
        'X-Auth-Token': 'test_984665af47a659c0a4af0eef5a2'
    }
    var q = url.parse(req.url, true);
    request.get(`https://test.instamojo.com/api/1.1/payment-requests/${q.query.payment_request_id}/`, {
        headers: headers
    }, async function (error, response, body) {
        if (!error && response.statusCode == 200) {
            obj = JSON.parse(body)
            console.log(obj.payment_request.payments[0]);
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
                return res.status(200).redirect("/api/dashboard");
            }
        } else {
            return res.status(400).send({
                error: error
            })
        }
    })

})

module.exports = {
    requestFromPay: request,
    paymentRoutes: router
};