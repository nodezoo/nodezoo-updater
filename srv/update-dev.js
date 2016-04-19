var Seneca = require('seneca')
var Entities = require('seneca-entity')
var RedisQ = require('seneca-redis-queue-transport')

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
  mesh: {
    auto: true
  }
}

var Service = Seneca()

Service
  .use(Entities)
  .use(RedisQ, opts.redisQ)
  .use('../npm-update.js')
  .listen(44005)
  .client({pin: 'role:updater,info:update', type: 'redis-queue'})
