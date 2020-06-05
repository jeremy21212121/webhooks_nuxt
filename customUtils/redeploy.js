const spawn = require('child_process').spawn
const path = require('path')
const { routes } = require(path.resolve('./config.js'))

// prefix for test bash scripts. an empty string if NODE_ENV !== 'test'.
const testPathPrefix = require(path.resolve('./customUtils/testPathPrefix.js'));

const redeploy = (eventPath) => new Promise((resolve, reject) => {
  // const targetPath = routes[eventPath].targetPath
  const rawScriptPath = routes[eventPath].redeploy
  const scriptPath = path.resolve(`.${testPathPrefix}${rawScriptPath}`)
  
  // spawn process and run script
  const cmd = spawn('/bin/bash', ['-e', scriptPath])

  // forward stdout/stderr from the spawned process to this node process for logging
  cmd.stdout.on('data', data => console.log(data.toString()))
  cmd.stderr.on('data', data => console.error(data.toString()))
  
  // a non-zero exit code means it failed.
  // This should be handled by the caller and the project rolled back to a known good state.
  cmd.on('exit', code => (code === 0) ? resolve(code) : reject(code))
})

// redeploys either front or back end to the last know good commit
// commit hash is stored before redeploy is attempted in push event handler
const rollBackToHash = (eventPath, commitHash) => new Promise((resolve, reject) => {
  // const targetPath = routes[eventPath].targetPath
  console.log('Rolling back to known good %s commit: %s', eventPath, commitHash)
  try {
  // spawn the relevant rollback script. Very similar to the deploy script, only we 'git checkout' to the last known good commit
    const rawScriptPath = routes[eventPath].rollback
    // if testing, it will run a stubbed test bash script
    const scriptPath = path.resolve(`.${testPathPrefix}${rawScriptPath}`)

    const cmd = spawn('/bin/bash', ['-e', scriptPath, commitHash])

    // handle stdout. It will be logged in the syslog by systemd.
    cmd.stdout.on('data', data => console.log(data.toString()))

    // reject promise. we shouldn't see any stderr output unless something went horribly wrong.
    cmd.stderr.on('data', data => reject(new Error('restore-hash-script-error')))

    // reject promise if the exit code isn't 0. Anything other than 0 is an error, it's a POSIX thing  
    cmd.on('exit', code => (code === 0) ? resolve(code) : reject(code))
  } catch(e) {
    // terrible error. let's make the caller figure it out.
    reject(e)
  }
})

// always resolves to an object that indicates if we redeployed, rolled back, or everything failed
const redeployOrRollBack = (eventPath, commitHash) => new Promise(async (resolve, reject) => {
	const value = { redeploy: false, rollback: false }
	try {
      const exitCode = await redeploy(eventPath) // rejects on failed redeploy
      value.redeploy = (exitCode === 0)
      resolve(value)
	} catch (e) {
      // rejection of the following must be handled in the caller
      const exitCode = await rollBackToHash(eventPath, commitHash).catch(e => e)
      value.rollback = (exitCode === 0)
      resolve(value)
	}
})

module.exports = redeployOrRollBack
