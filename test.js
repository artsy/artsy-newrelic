process.env.NEW_RELIC_LICENSE_KEY = 'foo'
const test = require('blue-tape')
const app = require('express')()
const newrelic = require('./')
const request = require('superagent')

let server
app.use(newrelic)
app.set('views', __dirname)
app.set('view engine', 'jade')
app.get('/locals', (req, res, next) => {
  res.send(typeof res.locals.newRelicHead)
})
app.get('/timeout', (req, res, next) => {
  setTimeout(() => res.send('done'), 1000)
})

test('before', () => {
  return new Promise((resolve) => {
    server = app.listen(5000, () => resolve())
  })
})

test('adds new relic to locals', (t) => {
  return request.get('http://localhost:5000/locals').then((res) => {
    t.equal(res.text, 'string')
  })
})

test('it times out requests', (t) => {
  process.env.NEW_RELIC_TIMEOUT = '500ms'
  return request.get('http://localhost:5000/timeout').catch((err) => {
    t.equal(Boolean(err.response.text.match('timeout')), true)
  })
})

test('after', () => {
  server.close()
  return Promise.resolve()
})
