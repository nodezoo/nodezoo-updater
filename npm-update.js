/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict"


var follow    = require('follow');
var npm_stats = require('npm-stats')
var async     = require('async')


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

  seneca.add('role:npm,cmd:startUpdater',  startFeed)
  seneca.add('role:npm,cmd:stopUpdater',  stopFeed)

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
