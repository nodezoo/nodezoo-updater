var Seneca = require('seneca')
var Entities = require('seneca-entity')
var RedisQ = require('seneca-redis-queue-transport')
var NpmUpdate = require('../lib/updater')

var envs = process.env

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
  },
  updater: {
    updaterLimit: envs.UPDATER_LIMIT
  }
}

var Service = Seneca()

Service
  .use(Entities)
  .use(RedisQ, opts.redisQ)
  .use(NpmUpdate, opts.updater)
  .listen(44005)
  .client({pin: 'role:updater,info:update', type: 'redis-queue'})
