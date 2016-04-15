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
  },
  mesh: {
    auto: true
  }
}

var Service = Seneca(opts.seneca)
var Consumer = Seneca(opts.seneca)

// Send to Q
Service.use(Entities)
       .use(RedisQ, opts.redisQ)
       .use(MsgStats, opts.msgStats)
       .use('../npm-update.js')
       .listen(44005)
       .repl(43005)
       .client({pin:'role:npm,info:change',type:'redis-queue'})

//Handle Packages Coming Off Q --- Needs to move elsewhere (nodezoo-info?)
Consumer.use(Entities)
      .use(RedisQ, opts.redisQ)
      .use('../consumer.js')
      .use('mesh', opts.mesh)
      .listen({pin:'role:npm,info:change',type:'redis-queue'})
