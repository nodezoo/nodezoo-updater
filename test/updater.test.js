'use strict'

const Code = require('code')
const Lab = require('lab')
const Seneca = require('seneca')
const Sinon = require('sinon')
const Proxy = require('proxyquire')
const Through2 = require('through2')

const Emitter = require('events').EventEmitter
const Inherits = require('util').inherits

const npmStatsObj = {list: function () {}}

process.env.WORKER_NO = 4

Sinon.stub(npmStatsObj, 'list', function () {
  var stream = Through2()
  setImmediate(() => {
    stream.write('[')
    stream.write('"honeybadger",')
    stream.write('"dont",')
    stream.write('"care",')
    stream.write(']')
  })
  return stream
})

let lastFeed
function Feed () {
  Emitter.call(this)
  this.start = () => {
    this.emit('start')
  }
  this.stop = () => {
    this.emit('stop')
  }
  lastFeed = this
}

Inherits(Feed, Emitter)

var npmStats = Sinon.stub().returns(npmStatsObj)
var Dequeue = Proxy('../lib/updater', {'npm-stats': npmStats, 'follow': {Feed: Feed}})

var lab = exports.lab = Lab.script()
var expect = Code.expect
var beforeEach = lab.beforeEach
var it = lab.it
var describe = lab.describe

var si
function createSi (opts) {
  var options = opts || {}
  beforeEach({}, function (done) {
    si = Seneca()
    si.use(Dequeue, options)
    si.ready(function (err) {
      if (err) {
        return process.exit(!console.error(err))
      }
      si.add('role:updater,info:update', function (msg, done) {
        done()
      })
      done(err)
    })
  })
}

describe('Calls "role:npm,cmd:registrySubscribe"', () => {
  createSi()
  it('Registry Subscribe Responds', function (done) {
    si.act({role: 'npm', cmd: 'registrySubscribe'}, function (err, respond) {
      expect(err).to.not.exist()
      expect(respond).to.exist()
      done(err)
    })
  })
  it('Feed is not started twice', function (done) {
    si.act({role: 'npm', cmd: 'registrySubscribe'}, function () {})
    si.act({role: 'npm', cmd: 'registrySubscribe'}, function (err, respond) {
      expect(respond.message).to.equal('already running')
      done(err)
    })
  })
})

describe('Calls "role:npm,cmd:registryUnsubscribe"', () => {
  createSi()
  it('Registry Unsubscribe Responds', function (done) {
    si.act({role: 'npm', cmd: 'registrySubscribe'}, function () {})
    si.act({role: 'npm', cmd: 'registryUnsubscribe'}, function (err, respond) {
      expect(err).to.not.exist()
      expect(respond).to.exist()
      done(err)
    })
  })
  it('Feed is not stopped twice', function (done) {
    si.act({role: 'npm', cmd: 'registryUnsubscribe'}, function () {})
    si.act({role: 'npm', cmd: 'registryUnsubscribe'}, function (err, respond) {
      expect(respond.message).to.equal('already stopped')
      done(err)
    })
  })
})

describe('Calls "role:npm,cmd:registryDownload without Opts"', () => {
  createSi()
  it('Registry Downloads Everything', function (done) {
    si.act({role: 'npm', cmd: 'registryDownload'}, function (err, respond) {
      Sinon.stub(si, 'act')
      expect(err).to.not.exist()
      expect(respond).to.exist()
      setImmediate(() => {
        expect(si.act.callCount).to.equal(3)
        done(err)
      })
    })
  })
})

describe('Calls "role:npm,cmd:registryDownload With Opts"', () => {
  createSi({updaterLimit: 2})
  it('Registry Downloads a limit of 2', function (done) {
    si.act({role: 'npm', cmd: 'registryDownload'}, function (err, respond) {
      Sinon.stub(si, 'act')
      expect(err).to.not.exist()
      expect(respond).to.exist()
      setImmediate(() => {
        expect(si.act.callCount).to.equal(2)
        done(err)
      })
    })
  })
})

describe('Feed', () => {
  createSi()
  it('Processes Feed Error', function (done) {
    lastFeed.on('stop', function () {
      done()
    })
    lastFeed.emit('error')
  })
  it('Processes Feed Changes', function (done) {
    Sinon.stub(si, 'act')
    lastFeed.emit('change', {id: 'honeybadger'})
    expect(si.act.calledWith('role:updater,info:update', {name: 'honeybadger'})).to.equal(true)
    done()
  })
})
