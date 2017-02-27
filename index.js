if (!process.env.NEW_RELIC_LICENSE_KEY) {
  module.exports = (req, res, next) => { next() }
} else {
  process.env.NEW_RELIC_HOME = __dirname
  const newrelic = require('newrelic')
  const timeout = require('connect-timeout')

  // Middleware to inject NewRelic browser monitoring and timeouts
  module.exports = (req, res, next) => {
    res.locals.newRelicHead = newrelic.getBrowserTimingHeader()
    timeout(process.env.NEW_RELIC_TIMEOUT || '29s')(req, res, next)
  }

  // Report uncaught exceptions with a custom
  const UncaughtError = function UncaughtError (err) {
    this.name = 'UncaughtError'
    this.message = err.message || err.toString()
    this.stack = err.stack
  }
  UncaughtError.prototype = Error.prototype
  process.on('uncaughtException', (e) => {
    const err = new UncaughtError(e)
    console.error('Uncaught Exception', err.stack)
    newrelic.noticeError(err, { crash: true })
    newrelic.shutdown({ collectPendingData: true }, (err) => {
      if (err) console.log('Failed to send to NewRelic.', err)
      else console.log('Sent to NewRelic, exiting process.')
      process.exit(1)
    })
  })
}
