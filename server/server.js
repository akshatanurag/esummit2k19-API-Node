const express = require('express');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const config = require("config");
const bodyParser = require('body-parser');
const session = require('express-session');

//const QRCode = require('qrcode');
//custom imports

if (!config.get('jwtPrivateKey')) {
  console.log("FATAL ERROR: jwtPrivateKey not defined");
  process.exit(1);
}

require('../db/connection');
const commonRoutes = require('../routes/common');
const authRoutes = require('../routes/auth');
const profileRoutes = require('../routes/profile')
const dashboardRoutes = require('../routes/dashboard')
const forgotRoutes = require('../routes/forgot')
const {
  paymentRoutes,
  requestFromPay
} = require('../routes/payment');
const qrGenRoutes = require('../routes/qr_gen')






let port = process.env.PORT || 3000;
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  //ALL CODE GOES IN HERE
  const app = express();
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  app.use(bodyParser.json());
  app.use(
    session({
      secret: "vffdvfdhjkvbsdjfvbjsdbcjhdasgchjadsgchjadshcs",
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: 3600000
      }
    })
  );

  app.use("/api", commonRoutes);
  app.use("/api", authRoutes);
  app.use("/api", profileRoutes);
  app.use("/api", dashboardRoutes);
  app.use("/api", forgotRoutes);
  app.use("/api", paymentRoutes);
  app.use("/api",qrGenRoutes);




  app.listen(port, process.env.IP)

  // console.log(`Worker ${process.pid} started`);
}