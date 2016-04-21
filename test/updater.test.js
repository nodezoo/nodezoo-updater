'use strict'

var Code = require('code')
var Lab = require('lab')
var Seneca = require('seneca')
var Sinon = require('sinon')
var Proxy = require('proxyquire')
var Through2 = require('through2')

var npmStatsObj = {list: function () {}}
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
var npmStats = Sinon.stub().returns(npmStatsObj)

var Dequeue = Proxy('../lib/updater', {'npm-stats': npmStats})

var lab = exports.lab = Lab.script()
var expect = Code.expect
var before = lab.before
var suite = lab.suite
var it = lab.it
var describe = lab.describe

var Service = Seneca()
Service.use(Dequeue)

suite('nodezoo-updater suite tests ', function () {
  before({}, function (done) {
    Service.ready(function (err) {
      if (err) {
        return process.exit(!console.error(err))
      }
      Service.add('role:updater,info:update', function (msg, done) {
        done()
      })
      done(err)
    })
  })
})

describe('nodezoo-updater tests', () => {
  it('Registry Subscribe Responds', function (done) {
    Service.act({role: 'npm', cmd: 'registrySubscribe'}, function (err, respond) {
      expect(err).to.not.exist()
      expect(respond).to.exist()
      done(err)
    })
  })
  it('Registry Unsubscribe Responds', function (done) {
    Service.act({role: 'npm', cmd: 'registryUnsubscribe'}, function (err, respond) {
      expect(err).to.not.exist()
      expect(respond).to.exist()
      done(err)
    })
  })
  it('Registry Download Responds', function (done) {
    Service.act({role: 'npm', cmd: 'registryDownload'}, function (err, respond) {
      expect(err).to.not.exist()
      expect(respond).to.exist()
      done(err)
    })
  })
  it('Feed is not started twice', function (done) {
    Service.act({role: 'npm', cmd: 'registrySubscribe'}, function () {})
    Service.act({role: 'npm', cmd: 'registrySubscribe'}, function (err, respond) {
      expect(respond.message).to.equal('already running')
      done(err)
    })
  })
  it('Feed is not stopped twice', function (done) {
    Service.act({role: 'npm', cmd: 'registryUnsubscribe'}, function () {})
    Service.act({role: 'npm', cmd: 'registryUnsubscribe'}, function (err, respond) {
      expect(respond.message).to.equal('already stopped')
      done(err)
    })
  })
})
