const http = require('http')
const createHandler = require('node-github-webhook')
const secrets = require('./secrets.js')
const handler = createHandler({ path: '/webhook1', secret: secrets[0] }) // single handler

// run redeploy bash script
const spawn = require('child_process').spawn

const redeploy = (prod = false) => new Promise((resolve, reject) => {
  let scriptPath = __dirname
  scriptPath += prod ? '/bash/redeploy_prod.sh' : '/bash/redeploy_dev.sh'
  const cmd = spawn('/usr/bin/bash', ['-e', scriptPath])
  cmd.stdout.on('data', data => console.log(data.toString()))
  cmd.stderr.on('data', data => console.error(data.toString()))
  cmd.on('exit', code => (code === 0) ? resolve(code) : reject(code))
})

const parseBranch = (refString) => {
  // pulls branch name from ref string
  const refArray = refString.split('/')
  let branch = ''
  if (refArray.length > 2) {
    branch = refArray[2]
  }
  return branch
}



http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', async function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )
  if (event.path === '/webhook1') {
    const branch = parseBranch(event.payload.ref)
    if (branch === 'newlook') {
      // pull, build, restart dev
      try {
        await redeploy(false)
      } catch (error) {
        console.error(error)
      }
    } else if (branch === 'master') {
      // // pull, build, restart master
      // try {
      //   await redeploy(true)
      // } catch (error) {
      //   console.error(error)
      // }
    } else {
      console.error(`Unkown ref: ${event.payload.ref}`)
    }
  }
})