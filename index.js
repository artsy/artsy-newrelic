if (!process.env.NEW_RELIC_LICENSE_KEY) {
  return module.exports = function(req, res, next) { next() }
}
process.env.NEW_RELIC_HOME = __dirname;
var newrelic = require('newrelic');

module.exports = function(req, res, next) {
  res.locals.newRelicHead = newrelic.getBrowserTimingHeader();
  next();
}

process.on('uncaughtException', function(err) {
  console.warn("Uncaught exception, process exited.");
  console.warn(err.stack);
  newrelic.noticeError(err);
  process.exit(1);
});
