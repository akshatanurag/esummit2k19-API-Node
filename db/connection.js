const mongoose = require('mongoose');
const log = require('../config/bunyan-config')
// mongodb://localhost/e-summit

    mongoose.connect("mongodb://akshat:Anurag2%40@13.233.34.78:27017/esummit", {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true 
    }).then(()=>{
        //console.log("connected to db")
    }).catch(()=>{
        log.error("Db not connected");
        //console.log("unable to connect");
    })

mongoose.Promise = global.Promise;

module.exports = {
    mongoose
}
