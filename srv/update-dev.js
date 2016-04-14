var Seneca = require('seneca')
var Entities = require('seneca-entity')
var RedisQ = require('seneca-redis-queue-transport')
var MsgStats = require('seneca-msgstats')

var STATS = process.env.STATS || 'localhost'

var opts = {
  redisStore: {
    host: 'localhost',
    port: 6379
  },
  redisQ: {
    'redis-queue': {
      timeout: 22222,
      type: 'redis-queue',
      host: 'localhost',
      port: 6379
    }
  },
  msgStats: {
    udp: { host:STATS },
    pin: 'role:npm, info:change'
  }
}

var Service = Seneca(opts.seneca)
var Consumer = Seneca(opts.seneca)

Service.use(Entities)
       .use(RedisQ, opts.redisQ)
      //  .use(MsgStats, opts.msgStats)
       .use('../npm-update.js')
       .listen(44005)
       .repl(43005)
       .client({pin:'role:npm,info:change',type:'redis-queue'})

Consumer.use(Entities)
      .use(RedisQ, opts.redisQ)
      .use('../consumer.js')
      // .listen(44006)
      // .repl(43006)
      .listen({pin:'role:npm,info:change',type:'redis-queue'})

// require('seneca')()
//   .use('redis-store', opts['redis-store'])
//   .use('redis-queue-transport', opts['redis-queue'])
//   .use('msgstats',{
//     udp: { host: STATS },
//     pin:'role:npm,info:change'
//   })
//
//   .use('../npm-update-new.js')

  // .client({pin:'role:npm,info:change',type:'redis-queue'})
  // .listen({pin:'role:npm,info:change',type:'redis-queue'})
  //
  // .listen(44005)
  // .repl(43005)
