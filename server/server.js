/***
 *
 *
 * ===============================
 * (: LET'S MAKE E-SUMMIT GREAT :)
 * ===============================
 *
 *
 */
const express = require('express');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const config = require('config');
const bodyParser = require('body-parser');
const session = require('express-session');
const sha256 = require('sha256');
//var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var cors = require('cors');
const hpp = require('hpp');
const helmet = require('helmet');
var compression = require('compression');
var contentLength = require('express-content-length-validator');
var MAX_CONTENT_LENGTH_ACCEPTED = 9999;
const jwt = require('jsonwebtoken');
require('../db/connection');

//const QRCode = require('qrcode');
//custom imports

if (
  !config.get('jwtPrivateKey') &&
  !process.env.SALT &&
  !process.env.SESSION_SECRET &&
  !process.env.password
) {
  console.log('FATAL ERROR: keys not defined');
  process.exit(1);
}

const commonRoutes = require('../routes/common');
const authRoutes = require('../routes/auth');
const profileRoutes = require('../routes/profile');
const dashboardRoutes = require('../routes/dashboard');
const forgotRoutes = require('../routes/forgot');
const { paymentRoutes, requestFromPay } = require('../routes/payment');
const qrGenRoutes = require('../routes/qr_gen');
const adminRoutes = require('../routes/admin');
const clientRoute = require('../routes/clients');
const impsRoutes = require('../routes/imps');

let port = process.env.PORT || 8080;
// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
  //ALL CODE GOES IN HERE
  const app = express();
  app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  
  app.use(bodyParser.json());
  app.use(
    session({
      name: 'SESS_ID',
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, //will make this true when we get ssl
        httpOnly: true,
        signed: true,
        maxAge: 86400000
      }
    })
  );
  app.use(cookieParser('6xH$*CYY*u44gcUN57%H'));
  app.use(cors({
    exposedHeaders: ['x-api-token','x-auth-token'],
    methods: ['GET','POST'],
    credentials: true
  }));
  app.use(hpp());
  app.disable('x-powered-by');
  app.use(function(req, res, next) {
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Frame-Options', 'deny');
    res.header('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(helmet());
  app.use(
    helmet.hidePoweredBy({
      setTo: 'KIIT Ecell Server 1.0'
    })
  ); //change value of X-Powered-By header to given value
  app.use(helmet())
  app.use(helmet.noSniff()); // set X-Content-Type-Options header
  app.use(helmet.frameguard()); // set X-Frame-Options header
  app.use(helmet.xssFilter()); // set X-XSS-Protection header
  app.use(compression());
  app.use(
    contentLength.validateMax({
      max: MAX_CONTENT_LENGTH_ACCEPTED,
      status: 400,
      message: 'Limit Reached'
    })
  );

  app.use("/api",clientRoute);
  app.use(function(req, res, next) {
    try {
      const date = Number(new Date().toLocaleDateString("en-GB").split("/").join(""));
      const modedDate = date + (date % 1000000);
      const xApiToken = sha256(modedDate + "kiitesummitzgOrJz91QOME8hrislove");
      if (req.header('x-api-token') === xApiToken)
        next();
      else
        return res
          .status(401).send({success: false,message: "Unauthorized Client"})
    } catch (e) {
      return res
        .status(401)
        .send({success: false,message: "Unauthorized Client"})
    }
  });
  app.use('/api', authRoutes);
  //Three level verification to stop other routes

// app.use(function(req,res,next){
//   var today = new Date();
//   var dd = today.getDate();
//   var mm = today.getMonth()+1; //January is 0!
//   var yyyy = today.getFullYear();
//   var completeDate = `${dd}/${mm}/${yyyy}`
//   if(completeDate == '20/1/2019')
//   next();
//   else
//   res.status(400).send({success: false, message: "Sorry!"})
// })
  // app.use(csrf());
  // app.use(function(req, res, next) {
  //   res.setHeader('XSRF-TOKEN', req.csrfToken());
  //   next();
  // });

  app.use('/api', commonRoutes);
  app.use('/api', forgotRoutes);
  app.use('/api', profileRoutes);
  app.use('/api', dashboardRoutes);
  app.use('/api', paymentRoutes);
  app.use('/api', qrGenRoutes);
  app.use('/api/admin', adminRoutes);
  app.use("/api/imps",impsRoutes);

  app.get('*', (req, res) => {


    return res.status(404).render("404")
  });
  app.post('*', (req, res) => {


    return res.status(404).render("404")
  });
 

  app.listen(port, process.env.IP);

  // console.log(`Worker ${process.pid} started`);
// }
