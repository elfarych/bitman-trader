const trader = require('./app/trader')
const globals = require('./globals')


globals.setGlobals()
trader.start().then(() => $logger(`Trader started v3...`))
