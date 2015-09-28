require('seneca')()
  .use('level-store')
  .use('..')
  .listen(9001)
  .repl()

