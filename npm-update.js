/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var follow = require('follow');
var npm_stats = require('npm-stats')
var async     = require('async')


module.exports = function npm_update( options ){
  var seneca = this

  options = seneca.util.deepextend({
    task: null,
    batchsize: 33,
    registry: 'https://skimdb.npmjs.com/registry'
  },options)


  seneca.add( 'role:npm,task:registry_subscribe', registry_subscribe )
  seneca.add( 'role:npm,task:process_modules',    process_modules )
  seneca.add( 'role:npm,task:download_modules',   download_modules )


  var state = {
    registry_subscribe: { status:'stop' },
    process_modules: { status:'stop' },
    download_modules: { status:'stop' },
  }
  

  function registry_subscribe( msg, respond ) {
    var seneca = this

    var feed

    if( feed && 'stop' === msg.control ) {
      state.registry_subscribe.status = 'stop'
      feed.stop()
    }

    process_control( 
      msg, respond, seneca, 'registry_subscribe', 
      function( msg, respond, result ){
        
        state.registry_subscribe.status = 'run'
        state.registry_subscribe.count = 0
        state.registry_subscribe.since = new Date().toISOString()

        feed = new follow.Feed({
          db: options.registry,
          since: 'now',
        })

        feed.on('error',function(error) {
          result(error)
        })

        feed.on('change',function(change) {
          state.registry_subscribe.count++
          state.registry_subscribe.last = new Date().toISOString()
          seneca.act('role:npm,info:change',{name:change.id})
        })

        feed.follow()
      })  
  }


  function process_modules( msg, respond ) {
    var seneca = this

    process_control( 
      msg, respond, seneca, 'process_modules', 
      function( msg, respond, result ){
        
        state.process_modules.status = 'run'
        state.process_modules.done = 0
        state.process_modules.total = 0

        seneca.make('mod').list$({done:false},function(err,list){
          if(err) return result(err)
          if( 'run' != state.process_modules.status ) return;

          state.process_modules.total = list.length

          async.eachLimit( list, options.batchsize, function(mod,done) {
            if( 'run' != state.process_modules.status ) return;

            var name = mod.id
            seneca.act('role:npm,info:change',{name:name})

            seneca.make('mod',{id$:name}).load$(function(err,mod){
              if( err ) return result(err)

              mod = mod || seneca.make('mod',{id$:name})
              mod.done = true

              mod.save$( function( err, mod ){
                if( err ) return result(err)

                state.process_modules.done++

                done()
              })
            })
          },result)
        })
      })
  }


  function download_modules( msg, respond ) {
    var seneca = this
    
    process_control( 
      msg, respond, seneca, 'download_modules', 
      function( msg, respond, result ){

        state.download_modules.status = 'run'
        state.download_modules.done = 0
        state.download_modules.total = 0

        var stats = npm_stats()
        stats.list({}, function(err,list){
          if(err) return result(err)
          if( 'run' != state.download_modules.status ) return;

          state.download_modules.total = list.length

          async.eachLimit( list, options.batchsize, function(name,done) {
            if( 'run' != state.download_modules.status ) return;

            seneca.make('mod',{id$:name,done:false}).save$(function(err,mod){
              if( err ) return done(err)
              state.download_modules.done++
              done()
            })
          },result)
        })
      })
  }


  function process_control( msg, respond, seneca, process_name, worker ) {

    function result(err) {
      if( err ) {
        state[process_name].status = 'stop'
        seneca.log(err)
        state[process_name].status = 'error'
        state[process_name].error = err
      }
      else {
        state[process_name].status = 'stop'
      }
    }


    if( 'stop' === msg.control ) {
      state[process_name].status = 'stop'
    }

    else if( 'status' === msg.get || 
             'run' === state[process_name].status ) 
    {
      // do nothing
    }

    else if( worker( msg, respond, result ) ) {
      // already responded
    }

    return respond( null, state[process_name] )
  }


  seneca.add({init:'npm_update'}, function(args,done){
    var seneca  = this

    if( options.task ) {
      seneca.root.act({role:'npm',task:options.task})
    }

    done()
  })

}
