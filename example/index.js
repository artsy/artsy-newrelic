const newrelic = require('../')
const app = module.exports = require('express')()

app.use(newrelic)
app.set('views', __dirname)
app.set('view engine', 'jade')
app.get('/', function (req, res, next) {
  res.render('index')
})

app.listen(4000, () => { console.log('Listening on 4000') })
