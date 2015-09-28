/* Copyright (c) 2014 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var npm_stats = require('npm-stats')
var async     = require('async')


module.exports = function npm_update( options ){
  var seneca = this

  options = seneca.util.deepextend({
    registry: 'http://registry.npmjs.org/'
  },options)


  //seneca.add( 'role:npm,task:registry_subscribe', registry_subscribe )
  //seneca.add( 'role:npm,task:process_modules',    process_modules )
  seneca.add( 'role:npm,task:download_modules',   download_modules )


  var state = {
    download_modules: { status:'stop' }
  }
  
  function download_modules( msg, respond ) {
    var seneca = this

    if( 'stop' === msg.control ) {
      state.download_modules.status = 'stop'
    }

    else if( 'status' === msg.get || 
             'run' === state.download_modules.status ) 
    {
      // do nothing
    }

    // run download and update
    else {
      state.download_modules.status = 'run'
      process.nextTick(function(){
        var stats = npm_stats()
        stats.list({}, function(err,list){
          if(err) return error(err)

          state.download_modules.done = 0
          state.download_modules.total = list.length

          async.eachLimit( list, 1, function(mod,done) {
            seneca.make('mod',{id$:mod,done:false}).save$(function(err,mod){
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

    return respond( null, state.download_modules )

    function error(err) {
      seneca.log(err)
      state.download_modules.status = 'error'
      state.download_modules.error = err
    }
  }



  seneca.add({init:'npm-update'}, function(args,done){
    var seneca  = this

    done()
  })

}
