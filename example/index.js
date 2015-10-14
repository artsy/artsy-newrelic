var newrelic = require('../');
var app = require('express')();

app.use(newrelic);
app.set('views', __dirname);
app.set('view engine', 'jade');
app.get('/', function(req, res, next) {
  res.render('index');
});

app.listen(4000, function() { console.log('Listening on 4000') });
