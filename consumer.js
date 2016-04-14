"use strict"

module.exports = function consumer( options ){
  var seneca = this

  seneca.add('role:npm,info:change',  onNpmChange)

  function onNpmChange (msg, respond) {
    var seneca = this
    console.log('on change message', msg)
    seneca.act('role:info, res:part', {name: package.id})
    respond(null, {message:'package changed'})
  }
}
