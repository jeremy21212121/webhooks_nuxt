const spawn = require('child_process').spawn
const path = require('path')

const redeployOrRollBack = require(path.resolve('./customUtils/redeploy.js'))
const sendErrorEmail = require(path.resolve('./customUtils/errorEmail.js'))
const { frontEndRoute, backEndRoute } = require(path.resolve('./config.js'))

const getKnownGoodCommitHash = (frontOrBack) => new Promise((resolve, reject) => {
	
  try {

    // bash script basically just runs 'git rev-parse HEAD'
    const cmd = spawn('/bin/bash', ['-e', path.resolve('./bash/get_head_commit.sh'), frontOrBack])

// there will only be one chunk, as the hash is only ~40 bytes and chunks are up to 8192 bytes. Still, it may be more robust to not make that assumption. Accumulate the data on 'data' event, then resolve with it on cmd 'exit' event if the code is 0?
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
  
})

const parseBranch = (refString) => {
  // parses branch name from ref string
  const refArray = refString.split('/')
  let branch = ''
  if (refArray.length > 2) {
    branch = refArray[2]
  }
  return branch
}

//~ simplified verison of above. We won't enable it until we are sure everything else is working, to avoid changing too much at once.
//~ const parseBranch = (ref) => ref.split('/')[2] || ''

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

	// await the known good hash for rolling back in case of build error
	let knownGoodHash = ''
	try {
      knownGoodHash = await getKnownGoodCommitHash(frontOrBack)
	} catch (e) {
      // couldn't get last known good hash, unsafe to proceed
      console.error(new Error("couldn't get last known good hash, unsafe to proceed"))
      console.error(e)
      await sendErrorEmail(`just-trivia ${frontOrBack}-end deploy failure. Couldn't get last known good hash, unsafe to proceed.`)
      process.exit(1)
	}
	
	if (shouldBuild) {
      try {
		// redeploy, if that fails roll back, if that fails send me an email and exit
        const redeployed = await redeployOrRollBack(frontOrBack, knownGoodHash)
        if (redeployed === false) {
		  // redeploy failed but rollback succeeded
		  console.error(new Error(`Deploy failure, rollback appears successful. ${frontOrBack}-end, last known good commit ${knownGoodHash}`))
          await sendErrorEmail(`just-trivia deploy failure, rollback appears successful. ${frontOrBack}-end, last known good commit ${knownGoodHash}`)
		}
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
