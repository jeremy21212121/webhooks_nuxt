const spawn = require('child_process').spawn

const redeployOrRollBack = require('./customUtils/redeploy.js')
const sendErrorEmail = require(path.resolve('./customUtils/errorEmail.js'))
const { frontEndRoute, backEndRoute } = require(path.resolve('./config.js'))

const getKnownGoodCommitHash = (frontOrBack) => new Promise((resolve, reject) => {
  try {
    // bash script basically just runs 'git rev-parse HEAD'
    const cmd = spawn('/bin/bash', ['-e', path.resolve('./bash/get_head_commit.sh'), frontOrBack])

    cmd.stdout.on('data', data => {
      // remove any sneaky newline characters, as they will make the length check fail
      const hashString = data.toString().replace(/\n/g, '')
      // commit hash should be 40 chars long
      if (hashString.length === 40) {
        resolve(hashString)
	  } else {
        reject(new Error('invalid-hash'))
	  }
	})
	// reject if there is any output to stderr
	cmd.stderr.on('data', data => reject(new Error('restore-hash-script-error')))
	// reject if the process exits with a non-zero exit code.
	cmd.on('exit', code => { if (code !== 0) { reject(new Error(`Commit hash exit code: ${code}`)) } })
  } catch(e) {
    reject(e)
  }
}

const parseBranch = (refString) => {
  // parses branch name from ref string
  const refArray = refString.split('/')
  let branch = ''
  if (refArray.length > 2) {
    branch = refArray[2]
  }
  return branch
}

const pushHandler = async (event) => {

  // log push event
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )
  
  const branch = parseBranch(event.payload.ref)
  
  // only run on push to master
  if (branch === 'master') {

	// are we redeploying the front or back end?
    let frontOrBack = ''
    if (event.path === frontEndRoute) {
		frontOrBack = 'front'
	} else if (event.path === backEndRoute) {
		frontOrBack = 'back'
	}
	
	// we should re-build/deploy if frontOrBack === "front" or "back"
	const shouldBuild = (frontOrBack === 'front' || frontOrBack === 'back')

	// await the known good hash in case of build error
	const knownGoodHash = await getKnowGoodCommitHash(frontOrBack)
	
	if (shouldBuild) {
      try {
		// redeploy, if that fails roll back, if that fails send me an email
        await redeployOrRollBack(frontOrBack, knownGoodHash)
      } catch (error) {
		// uh-oh, both redeploy and roll back failed. Game over man, game over! All hope is lost. Throw yourselves in the road.
        // send an email via contact form API at jeremypoole.ca/api/send
        console.error(new Error(`Deploy failure and rollback failure. Manual intervention required. ${frontOrBack}-end, last known good commit ${knownGoodHash}`))
        console.error(error)
        // this function returns a promise that shouldn't ever reject. It will however resolve(false) if the POST fails
        await sendErrorEmail(`Just Trivia build failure. ${frontOrBack}-end, last known good commit ${knownGoodHash}`)
        process.exit(1)
      }
	} else {
	  // shouldnt build, route not found
	  console.log('Route note found: %s', event.path)
	}
  } else {
    console.log('Invalid branch: %s', branch)
  }

}

module.exports = pushHandler
