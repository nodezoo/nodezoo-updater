"use strict"

module.exports = function consumer( options ){
  var seneca = this

  seneca.add('role:npm,info:change',  onNpmChange)

  function onNpmChange (pkg, respond) {
    var seneca = this
    seneca.act({role:'info', res:'part', name: pkg.name}, (err) => {
      respond(err, {message:`${pkg.name} package was updated `})
    })
  }
}
