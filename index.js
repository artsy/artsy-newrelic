if (!process.env.NEW_RELIC_LICENSE_KEY) {
  return module.exports = function(req, res, next) { next() }
}
process.env.NEW_RELIC_HOME = __dirname;
var newrelic = require('newrelic');

module.exports = function(req, res, next) {
  res.locals.newRelicHead = newrelic.getBrowserTimingHeader();
  next();
}

var UncaughtError = function UncaughtError(err) {
  this.name = 'UncaughtError';
  this.message = err.message || err.toString();
  this.stack = err.stack;
};

process.on('uncaughtException', function(e) {
  var err = new UncaughtError(e);
  console.error("Uncaught Exception", err.stack);
  newrelic.noticeError(err, { crash: true });
  newrelic.shutdown({ collectPendingData: true }, function(err) {
    err
      ? console.log("Failed to send to NewRelic.", err)
      : console.log("Sent to NewRelic, exiting process.");
    process.exit(1);
  });
});
