const mongoose = require('mongoose');
const log = require('../config/bunyan-config')
// mongodb://localhost/e-summit
//mongodb://techies:techiescodefastaf%23tJ5qF6rBCK%242019@13.127.68.61:27017/esummit
    mongoose.connect("mongodb://esummittechies:P68NUqoVf6Wh2PTGWhTW%23techiescodefastaf@35.154.114.3:27017/Kiitesummit", {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true 
    }).then(()=>{
        //console.log("connected to db");
    }).catch(()=>{
        log.error("Db not connected");
        console.log("unable to connect");
    })

mongoose.Promise = global.Promise;

module.exports = {
    mongoose
}
