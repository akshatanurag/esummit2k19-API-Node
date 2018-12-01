const mongoose = require('mongoose');
//mongodb://root:kW8Qc7gBT@ds123434.mlab.com:23434/esummit
mongoose.connect("mongodb://localhost/e-summit", {
    useNewUrlParser: true
}, () => {
    console.log("connected to db");
});
mongoose.Promise = global.Promise;

module.exports = {
    mongoose
}