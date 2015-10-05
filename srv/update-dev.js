var BEANSTALK = process.env.BEANSTALK || 'localhost'

require('seneca')()
  .use('level-store')
  .use('beanstalk-transport')
  .use('msgstats',{pin:'role:npm,info:change'})
  .use('../npm-update.js')

  .client({ host:BEANSTALK, pin:'role:npm,info:change',type:'beanstalk' })

  .listen(44005)
  .repl(43005)

