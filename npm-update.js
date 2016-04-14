/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict"


var follow     = require('follow')
var Registry   = require('npm-stats')()
var async      = require('async')
var JSONStream = require('JSONStream')


module.exports = function npmUpdate( options ){
  var seneca = this

  var opts = Object.assign({
    task: null,
    batchsize: 33,
    registry: 'https://skimdb.npmjs.com/registry'
  }, options)

  var feedRunning = false
  var feed = new follow.Feed({
    db: opts.registry,
    since: 'now'
  })
  feed.on('start', onFeedStart)
  feed.on('stop', onFeedStop)
  feed.on('error', (err) => {
    console.log('feed error', err)
    feed.stop()
  })

  feed.on('change', (pkg) => {
    console.log(pkg, 'package changed')
    seneca.act('role:npm,info:change', {name: pkg.id})
  })

  seneca.add('role:npm,cmd:registrySubscribe',  startFeed)
  seneca.add('role:npm,cmd:registryUnsubscribe',  stopFeed)
  seneca.add('role:npm,cmd:registryDownload',  downloadRegistry)

  function downloadRegistry (msg, respond) {
    var npmList = Registry.list()
    npmList.pipe(JSONStream.parse('*')).on('data', (pkgId) => {
      console.log(pkgId)
      seneca.act('role:npm,info:change', {name: pkgId})
    })
    console.log('npm list')
    respond(null, {
      message: 'downloading'
    })
  }

  function startFeed (msg, respond) {
    var seneca = this

    if (feedRunning) return respond(null, {
      message: 'already running'
    })

    feed.start()
    respond(null, {
      message: 'started'
    })
  }

  function stopFeed (msg, respond) {
    var seneca = this

    if (!feedRunning) return respond(null, {
      message: 'already stopped'
    })

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
