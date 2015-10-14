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
  console.error("Uncaught exception.");
  console.error(err.stack);
  newrelic.noticeError(err);
  newrelic.agent.harvest(function() {
    console.log("Sent to NewRelic, exiting process.");
    process.exit(1);
  });
});
