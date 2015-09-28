require('seneca')()
  .use('level-store')
  .use('..')

  .add('role:npm,info:change',function( msg, respond ){
    console.log( this.util.clean(msg) )
    respond()
  })

  .listen(9001)
  .repl()
