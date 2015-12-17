
var STATS = process.env.STATS || 'localhost'

require('seneca')()
  .use('level-store')
  .use('msgstats',{
    udp: { host: STATS },
    pin:'role:npm,info:change'
  })
  .use('../npm-update.js')

  .use( 'mesh', {auto:true} )

