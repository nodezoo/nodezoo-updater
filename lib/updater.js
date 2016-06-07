'use strict'

const Follow = require('follow')
const NpmStats = require('npm-stats')
const JSONStream = require('JSONStream')
const FastQ = require('fastq')
const envs = process.env

module.exports = function (options) {
  var seneca = this

  let worker_no = envs.WORKER_NO || 1
  let queue = FastQ(worker, worker_no)

  var opts = seneca.util.deepextend({
    registry: 'https://skimdb.npmjs.com/registry'
  }, options)

  var feedRunning = false

  var feed = new Follow.Feed({
    db: opts.registry,
    since: 'now'
  })

  feed.on('start', onFeedStart)
  feed.on('stop', onFeedStop)
  feed.on('error', (err) => {
    seneca.log.error(err)
    feed.stop()
  })

  feed.on('change', (pkg) => {
    queue.push({name: pkg.id, context: this})
  })

  seneca.add('role:npm,cmd:registrySubscribe', startFeed)
  seneca.add('role:npm,cmd:registryUnsubscribe', stopFeed)
  seneca.add('role:npm,cmd:registryDownload', downloadRegistry)

  function downloadRegistry (msg, respond) {
    var RegistryStream = NpmStats().list()
    var context = this

    var limit = parseInt(options.updaterLimit || 0, 10)
    var counter = 0

    RegistryStream
      .pipe(JSONStream.parse('*'))
      .on('data', (pkgId) => {
        if (limit && counter >= limit) {
          context.log.info('Updater limit exceeded: ', counter, limit)
          return
        }
        context.log.info(`Add to execution queue module ${pkgId}`)

        queue.push({name: pkgId, context: context}, respond)
        counter++
      })
    respond(null, {
      message: 'downloading'
    })
  }

  function worker (task, callback) {
    var context = task.context
    context.log.info(`Try to update module: ${task.name}, queue length: ${queue.length()}`)

    context.act('role:updater,info:update', {name: task.name}, function (err, response) {
      // @hack - dequeue should be able to execute serially these messages
      // as this is not possible right now we are using this hack, of delaying next module update for a time
      setTimeout(() => {
        context.log.info(`Done updating module: ${task.name}, queue length: ${queue.length()}`)
        callback(err, response)
      }, 1 * 1000)
    })
  }

  function startFeed (msg, respond) {
    if (feedRunning) return respond(null, {message: 'already running'})

    feed.start()
    respond(null, {
      message: 'started'
    })
  }

  function stopFeed (msg, respond) {
    if (!feedRunning) return respond(null, {message: 'already stopped'})

    feed.stop()
    respond(null, {
      message: 'stopped'
    })
  }

  function onFeedStart () {
    feedRunning = true
  }

  function onFeedStop () {
    feedRunning = false
  }

  return {
    name: 'nodezoo-updater'
  }
}
