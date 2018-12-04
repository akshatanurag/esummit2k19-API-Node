const mongoose = require('mongoose');
// mongodb://localhost/e-summit
try {
    if(mongoose.connect("mongodb://root:kW8Qc7gBT@ds123434.mlab.com:23434/esummit", {
        useNewUrlParser: true
    }))
    console.log("db connected")
    else
    throw "err"
} catch (e) {
    console.log("Unable to connect to db");
}

mongoose.Promise = global.Promise;

module.exports = {
    mongoose
}