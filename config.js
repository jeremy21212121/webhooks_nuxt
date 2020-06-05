const path = require('path')

const port = 7777
const host = '127.0.0.1'
const frontEndRoute = '/frontend'
const backEndRoute = '/backend'
const routes = {
  '/frontend': {
    redeploy: '/bash/redeploy_front_end.sh',
    rollback: '/bash/roll_back_front.sh',
    targetDirectory: '/opt/just-trivia-nuxt',
    branch: 'master'
  },
  '/backend': {
    redeploy: '/bash/redeploy_back_end.sh',
    rollback: '/bash/roll_back_front.sh',
    targetDirectory: '/opt/trivia-backend',
    branch: 'master'
  }
}
const secrets = require(path.resolve('./secrets/trivia.js'))

module.exports = { port, host, frontEndRoute, backEndRoute, routes, secrets }
