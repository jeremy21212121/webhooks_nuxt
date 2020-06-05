// const spawn = require('child_process').spawn
const path = require('path')

const redeployOrRollBack = require(path.resolve('./customUtils/redeploy.js'))
const sendErrorEmail = require(path.resolve('./customUtils/errorEmail.js'))
const parseBranch = require(path.resolve('./customUtils/parseBranch.js'))
const getKnownGoodCommitHash = require(path.resolve('./customUtils/getKnownGoodCommitHash.js'))
const errorHandlers = require(path.resolve('./customUtils/errorHandlers.js'))
const { routes } = require(path.resolve('./config.js'))

const pushHandler = async (event) => {

  // log push event
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )
  
  const branch = parseBranch(event.payload.ref)
  
  // only run on push to correct branch
  if (routes.hasOwnProperty(event.path) && (branch === routes[event.path].branch)) {

  const targetDirectory = routes[event.path].targetDirectory
	// we should re-build/deploy if event.path is a valid route
  const shouldBuild = routes.hasOwnProperty(event.path)

	// await the known good hash for rolling back in case of build error
	let knownGoodHash = ''
	try {
      knownGoodHash = await getKnownGoodCommitHash(targetDirectory)
	} catch (e) {
      // couldn't get last known good hash, unsafe to proceed
      errorHandlers.commitHash(event.path)
      // const errorString = `Couldn't get last known good hash, unsafe to proceed: ${event.path}`
      // console.error(new Error(errorString))
      // console.error(e)
      // await sendErrorEmail(errorString)
      // process.exit(1)
  }
	
	if (shouldBuild) {
      try {
    // redeploy- if that fails, roll back and notify by email- if that fails, notify by email and kill the server

        // result: { redeployed: Boolean, rollback: Boolean }
        const result = await redeployOrRollBack(event.path, knownGoodHash)

        if (result.redeploy && !result.rollback) {
          //success
          console.log(`Re-deploy success. ${event.path} - commit ${knownGoodHash}.`)
        }
        else if (!result.redeploy && result.rollback) {
        // redeploy failed but rollback succeeded
          errorHandlers.redeploy(event.path, knownGoodHash)
        }
        else {
          // Both redeploy and roll back failed. Sends email notification and terminates the process.
          errorHandlers.rollback(event.path, knownGoodHash)
        }

      } catch (error) {
        // none of the promises in the try block should be able to reject. If we ended up here, something has gone horribly wrong.
        errorHandlers.unforseen(event.path, knownGoodHash, error)
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
