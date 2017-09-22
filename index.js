if (!process.env.NEW_RELIC_LICENSE_KEY) {
  module.exports = (req, res, next) => next()
} else {
  process.env.NEW_RELIC_HOME = __dirname
  const newrelic = require('newrelic')
  const timeout = require('connect-timeout')

  const reportAndCrash = err => {
    console.error(err.name, err.stack)
    newrelic.noticeError(err, { crash: true })
    newrelic.shutdown({ collectPendingData: true }, err => {
      if (err) console.log('Failed to send to NewRelic.', err)
      else console.log('Sent to NewRelic, exiting process.')
      process.exit(1)
    })
  }

  // Middleware to inject NewRelic browser monitoring and timeouts
  module.exports = (req, res, next) => {
    res.locals.newRelicHead = newrelic.getBrowserTimingHeader()
    timeout(process.env.NEW_RELIC_TIMEOUT || '29s')(req, res, next)
  }

  // Report and crash when going over memory limit of the environment
  if (process.env.WEB_MEMORY && !process.env.NEW_RELIC_NO_MEMORY_LIMIT) {
    const interval = setInterval(() => {
      const MBUsed = process.memoryUsage().heapUsed / 1000000
      if (MBUsed > Number(process.env.WEB_MEMORY)) {
        reportAndCrash(new Error('Memory limit exceeded'))
        clearInterval(interval)
      }
    }, Number(process.env.NEW_RELIC_MEMORY_CHECK_INTERVAL) || 60000)
  }

  // Report uncaught exceptions with a custom error
  const UncaughtError = function UncaughtError (err) {
    this.name = 'UncaughtError'
    this.message = err.message || err.toString()
    this.stack = err.stack
  }
  UncaughtError.prototype = Error.prototype
  process.on('uncaughtException', e => reportAndCrash(new UncaughtError(e)))
}
