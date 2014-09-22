
var seneca = require('seneca')()
      .client({port:9001,pin:'role:npm'})
      .use('../npm-update.js')

