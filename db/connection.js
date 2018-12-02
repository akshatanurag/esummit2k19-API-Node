const mongoose = require('mongoose');
// mongodb://localhost/e-summit
mongoose.connect("mongodb://root:kW8Qc7gBT@ds123434.mlab.com:23434/esummit", {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;

module.exports = {
    mongoose
}