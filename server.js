const http = require('http')
const spawn = require('child_process').spawn
const createHandler = require('node-github-webhook')

const pushHandler = require('./handlers/push.js')

const { baseRoute, secrets, port, host } = require('./config.js')

const handler = createHandler({ path: baseRoute, secret: secrets[0] })

handler.on('error', function (err) {
  console.error(err)
})

handler.on('push', pushHandler)

const server = http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end('{"error":true}')
  })
})

server.listen(port, host)
