const bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'esummit_logs',
    streams: [{
      level: 'error',
      path: 'config/error.json' // log ERROR and above to a file
    }]
  })

module.exports = log;