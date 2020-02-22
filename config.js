const path = require('path')

const port = 7777
const host = '127.0.0.1'
const frontEndRoute = '/frontend'
const backEndRoute = '/backend'
const secrets = require(path.resolve('./secrets/trivia.js'))

module.exports = { port, host, frontEndRoute, backEndRoute, secrets }
