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
      host: envs.UPDATER_REDIS_HOST || 'localhost',
      port: envs.UPDATER_REDIS_PORT || '6379'
    }
  },
  mesh: {
    auto: true,
    host: envs.UPDATER_HOST || '127.0.0.1',
    bases: [envs.BASE_HOST || '127.0.0.1:39999'],
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
