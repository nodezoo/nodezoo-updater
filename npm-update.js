'use strict'

var Follow = require('Follow')
var NpmStats = require('npm-stats')
var JSONStream = require('JSONStream')

module.exports = function (options) {
  var seneca = this

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
    seneca.act('role:updater,info:update', {name: pkg.id})
  })

  seneca.add('role:npm,cmd:registrySubscribe', startFeed)
  seneca.add('role:npm,cmd:registryUnsubscribe', stopFeed)
  seneca.add('role:npm,cmd:registryDownload', downloadRegistry)

  function downloadRegistry (msg, respond) {
    var RegistryStream = NpmStats().list()

    var limit = options.updaterLimit || 0
    var counter = 0

    RegistryStream
      .pipe(JSONStream.parse('*'))
      .on('data', (pkgId) => {
        if (limit && counter >= limit) return
        seneca.act('role:updater,info:update', {name: pkgId})
        counter++
      })
    respond(null, {
      message: 'downloading'
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
}
