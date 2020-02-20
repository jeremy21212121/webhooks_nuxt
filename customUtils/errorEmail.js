const https = require('https')

const httpsPostJson = ({ body, ...options }) => new Promise((resolve, reject) => {
  const req = https.request({
    method: 'POST',
    ...options
  }, res => {
    const chunks = []
    res.on('data', data => chunks.push(data))
    res.on('end', () => {
      let body = Buffer.concat(chunks)
      // always json from this endpoint
      body = JSON.parse(body)
      resolve(body)
	})
  })
  req.on('error', err => reject(err))
  if (body) {
    req.write(body)
  }
  req.end()
})

const sendErrorEmail = (message) => new Promise(async (resolve) => {
// dont bother rejecting on failure. If this fails, we have just had 3 levels of cascading failures and I should just move into the woods.
  try {
    const res = await httpsPostJson({
      hostname: 'jeremypoole.ca',
      path: '/api/send',
      headers: {
        'Content-Type': 'application/json'
      },
	  body: `{"name":"Build Error","email":"just_trivia@jeremypoole.ca","text":"${message}"}`
    })
    if (res.success) {
      resolve(true)
	} else {
      console.error('Error sending fatal error email. All hope is lost.')
      resolve(false)
	}
  } catch (e) { resolve(false) }
})

module.exports = sendErrorEmail
