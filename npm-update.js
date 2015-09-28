/* Copyright (c) 2014 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var npm_stats = require('npm-stats')
var async     = require('async')


module.exports = function npm_update( options ){
  var seneca = this

  options = seneca.util.deepextend({
    batchsize: 1,
    registry: 'http://registry.npmjs.org/'
  },options)


  //seneca.add( 'role:npm,task:registry_subscribe', registry_subscribe )
  seneca.add( 'role:npm,task:process_modules',    process_modules )
  seneca.add( 'role:npm,task:download_modules',   download_modules )


  var state = {
    download_modules: { status:'stop' },
    process_modules: { status:'stop' }
  }
  

  function process_modules( msg, respond ) {
    var seneca = this

    process_control( 
      msg, respond, seneca, 'process_modules', 
      function( msg, respond, error ){
        
        state.process_modules.status = 'run'
        
        seneca.make('mod').list$({done:false},function(err,list){
          if(err) return error(err)

          state.process_modules.done = 0
          state.process_modules.total = list.length

          async.eachLimit( list, options.batchsize, function(mod,done) {
            var name = mod.id
            seneca.act('role:npm,info:change',{name:name})

            seneca.make('mod',{id$:name}).load$(function(err,mod){
              if( err ) return error(err)

              mod = mod || seneca.make('mod',{id$:name})
              mod.done = true

              mod.save$( function( err, mod ){
                if( err ) return error(err)

                state.process_modules.done++

                done()
              })
            })
          },function(err){
            if(err) return error(err)
          })
        })
      })
  }


  function download_modules( msg, respond ) {
    var seneca = this
    
    process_control( 
      msg, respond, seneca, 'download_modules', 
      function( msg, respond, error ){

        state.download_modules.status = 'run'

        var stats = npm_stats()
        stats.list({}, function(err,list){
          if(err) return error(err)

          state.download_modules.done = 0
          state.download_modules.total = list.length

          async.eachLimit( list, options.batchsize, function(name,done) {
            seneca.make('mod',{id$:name,done:false}).save$(function(err,mod){
              if( err ) return done(err)
              state.download_modules.done++
              done()
            })
          },function(err){
            if(err) return error(err)
          })
        })
      })
  }


  function process_control( msg, respond, seneca, process_name, worker ) {

    function error(err) {
      seneca.log(err)
      state[process_name].status = 'error'
      state[process_name].error = err
    }

    if( 'stop' === msg.control ) {
      state[process_name].status = 'stop'
    }

    else if( 'status' === msg.get || 
             'run' === state[process_name].status ) 
    {
      // do nothing
    }

    else if( worker( msg, respond, error ) ) {
      // already responded
    }

    return respond( null, state[process_name] )
  }


  seneca.add({init:'npm-update'}, function(args,done){
    var seneca  = this

    done()
  })

}
