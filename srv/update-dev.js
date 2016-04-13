var Seneca = require('seneca')
var Entities = require('seneca-entity')
var RedisStore = require('seneca-redis-store')
var RedisQ = require('seneca-redis-queue-transport')
var MsgStats = require('seneca-msgstats')

var STATS = process.env.STATS || 'localhost'

var opts = {
  redisStore: {
    host: 'localhost',
    port: 6379
  },
  redisQ: {
      timeout: 22222,
      type: 'redis-queue',
      host: 'localhost',
      port: 6379
    },
    msgStats: {
      udp: { host:STATS },
      pin: 'role:npm, info:change'
    }
}

var Service = Seneca(opts.seneca)

Service.use(Entities)
       .use(RedisStore, opts.redisStore)
       .use(RedisQ, opts.redisQ)
       .use(MsgStats, opts.msgStats)
       .use('../npm-update-new.js')
       .listen(44005)
       .repl(43005)

// require('seneca')()
//   .use('redis-store', opts['redis-store'])
//   .use('redis-queue-transport', opts['redis-queue'])
//   .use('msgstats',{
//     udp: { host: STATS },
//     pin:'role:npm,info:change'
//   })
//
//   .use('../npm-update-new.js')

  // .client({ host:BEANSTALK, pin:'role:npm,info:change',type:'beanstalk' })
  //
  // .listen(44005)
  // .repl(43005)
