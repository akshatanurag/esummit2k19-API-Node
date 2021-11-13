const mongoose = require('mongoose');
const log = require('../config/bunyan-config')
// mongodb://localhost/e-summit

    mongoose.connect("mongodb://localhost/e-summit", {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true  
    }).then(()=>{
        console.log("connected to db")
    }).catch(()=>{
        log.error("Db not connected");
        //console.log("unable to connect");
    })

mongoose.Promise = global.Promise;

module.exports = {
    mongoose
}
