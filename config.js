const path = require('path')

const port = 7777
const host = '127.0.0.1'
const baseRoute = '/webhooks'
const frontEndRoute = '/webhooks/trivia/frontend'
const backEndRoute = '/webhooks/trivia/backend'
const secrets = require(path.resolve('./secrets/trivia.js'))

module.exports = { port, host, baseRoute, frontEndRoute, backEndRoute, secrets }
