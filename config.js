const path = require('path')

const port = 7777
const host = '127.0.0.1'
//const baseRoute = '/trivia'
const frontEndRoute = '/trivia/frontend'
const backEndRoute = '/trivia/backend'
const secrets = require(path.resolve('./secrets/trivia.js'))

module.exports = { port, host, baseRoute, frontEndRoute, backEndRoute, secrets }
