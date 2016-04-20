'use strict'

var Code = require('code')
var Lab = require('lab')
var Seneca = require('seneca')
var Dequeue = require('../lib/updater')

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
      Service.add('role:info,req:part', function (args, done) {
        done()
      })
      done()
    })
  })
})

describe('nodezoo-updater tests', () => {
  it('Plugin Recieves Messages', function (done) {
    Service.act({role: 'updater', info: 'update', name: 'honeybadger'}, function (err, respond) {
      expect(err).to.not.exist()
      done(err)
    })
  })
  it('Plugin Responds to Messages', function (done) {
    Service.act({role: 'updater', info: 'update', name: 'honeybadger'}, function (err, respond) {
      expect(respond).to.exist()
      done(err)
    })
  })
})
