process.env.WEB_MEMORY = '1'
process.env.NEW_RELIC_MEMORY_CHECK_INTERVAL = '400'
process.env.NEW_RELIC_LICENSE_KEY = 'foo'
const sinon = require('sinon')
const test = require('blue-tape')
require('../')
const spy = sinon.spy(console, 'error')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

test("crashes and reports when over the enviornment's memory limit", async t => {
  await sleep(500)
  const errorMsg = spy.args[0][1]
  t.equal(Boolean(errorMsg.match('Memory limit exceeded')), true)
})
