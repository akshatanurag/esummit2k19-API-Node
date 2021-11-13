const request = require("request");
const express = require("express");
const axios = require("axios");

const router = express.Router();
const { User } = require("../models/user");
const { Profile } = require("../models/profile");
const middleware = require("../middleware/middleware");
const log = require("../config/bunyan-config");

router.get(
  "/pay",
  [
    middleware.isLoggedIn,
    middleware.isProfileComplete,
    middleware.isKiitStudent,
  ],
  async (req, res) => {
    try {
      var findUser = await User.findOne({
        email: req.user.email,
      })
        .select("-password")
        .select("-secureSessionID");
      if (!findUser)
        return res.status(400).send({
          success: false,
          message: "User not registred",
        });
      if (findUser.payments.isPaid)
        return res.status(400).send({
          success: false,
          message: "You have done that already!",
        });

      var findProfile = await Profile.findOne({
        user_id: findUser._id,
      });
      if (!findProfile)
        return res.status(400).send({
          success: false,
          message: "Profile not registred",
        });

      var headers = {
        "X-Api-Key": "test_c10c242d09fa6d2792deed0c82a",
        "X-Auth-Token": "test_984665af47a659c0a4af0eef5a2",
      };
      if (findProfile.uni == "kiit university") amt = "850";
      else amt = "1050";
      var payload = {
        purpose: "E-Summit 2019",
        amount: amt,
        phone: findProfile.mob_no,
        buyer_name: findProfile.fullName,
        redirect_url: `http://localhost:3000/dashboard`,
        send_email: false,
        //webhook: `http://${req.headers.host}/api/webhook/`,
        send_sms: false,
        email: findUser.email,
        allow_repeated_payments: false,
      };

      await request.post(
        "https://test.instamojo.com/api/1.1/payment-requests/",
        {
          form: payload,
          headers: headers,
        },
        function (error, response, body) {
          if (!error && response.statusCode == 201) {
            const obj = JSON.parse(body);
            console.log(obj);
            return res.status(200).json({
              success: "Now redicet user to instamojo page (longurl)",
              lognurl: obj.payment_request.longurl,
            });
          } else {
            return res.status(400).send({
              success: false,
              message: error,
            });
          }
        }
      );

      //   axios
      //     .post("https://test.instamojo.com/api/1.1/payment-requests/", {
      //       form: payload,
      //       headers: headers,
      //     })
      //     .then((r) => console.log(r.json()));
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        success: false,
        message: "Opps! Something went wrong",
      });
    }
  }
);

// router.get("/thankyou", [middleware.isLoggedIn, middleware.isProfileComplete,middleware.isKiitStudent,middleware.isVerified, middleware.isSeatLeft],async (req, res) => {
//     try {
//         var headers = {
//             'X-Api-Key': 'test_c10c242d09fa6d2792deed0c82a',
//             'X-Auth-Token': 'test_984665af47a659c0a4af0eef5a2'
//         }
//         var q = url.parse(req.url, true);
//         if(!q.query.payment_request_id || !q.query.payment_id)
//         {
//             return res.status(404).send({
//                 success: false,
//                 error: "The page was not found"});
//         }

//         request.get(`https://test.instamojo.com/api/1.1/payment-requests/${q.query.payment_request_id}/`, {
//             headers: headers
//         }, async function (error, response, body) {
//             if (!error && response.statusCode == 200) {
//                 obj = JSON.parse(body)
//                 //console.log(obj.payment_request.payments[0]);
//                 if (obj.payment_request.payments[0].status == 'Credit') {
//                     var findUser = await User.findOne({
//                         email: obj.payment_request.email
//                     }).select('-password').select('-secureSessionID');
//                     if (!findUser)
//                         return res.status(400).send({
//                             error: "User not registred"
//                         })

//                     findUser.payments.isPaid = true;
//                     findUser.payments.payment_id = obj.payment_request.id
//                     findUser.payments.instamojo_id = obj.payment_request.payments[0].payment_id
//                     await findUser.save();

//                     //success
//                     return res.status(200).send({
//                         success: true,
//                         message: "Payment was successfull",

//                     });
//                 }
//             } else {
//                 return res.status(400).send({
//                     error: "Opps! Something went wrong"
//                 })
//             }
//         })
//     } catch (error) {
//         log.error(error);
//         return res.status(400).send({
//             success: false,
//             message: "Opps! Something went wrong"
//         })
//     }

// })

module.exports = {
  requestFromPay: request,
  paymentRoutes: router,
};
