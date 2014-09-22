/* Copyright (c) 2014 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var npm_updates = require('npm-updates')



module.exports = function( options ){
  var seneca = this
  var plugin = 'npm-update'

  options = seneca.util.deepextend({
    registry: 'http://registry.npmjs.org/'
  },options)


  seneca.add(
    'role:npm-update,cmd:update', 
    cmd_update)


  seneca.add(
    'role:npm-update,info:update', 
    function(args,done){done})




  function cmd_update( args, done ) {
    console.log(args.data)
    done()
  }



  seneca.add({init:plugin}, function(args,done){
    var seneca  = this
    var updates = new npm_updates()

    updates.on('update', function(data) {
      seneca.act({role:plugin,cmd:'update',data:data})
    })

    updates.on('new', function(data) {
      seneca.act({role:plugin,cmd:'update',data:data})
    })

    done()
  })


  return plugin;
}
