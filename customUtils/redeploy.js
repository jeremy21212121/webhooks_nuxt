const spawn = require('child_process').spawn
const path = require('path')

const redeploy = (frontOrBack) => new Promise((resolve, reject) => {

  const scriptPath = path.resolve(`./bash/redeploy_${frontOrBack}_end.sh`)
  
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
const rollBackToHash = (frontOrBack, commitHash) => new Promise((resolve, reject) => {
  try {
	// spawn the relevant rollback script. Very similar to the deploy script, only we 'git checkout' to the last known good commit
    const cmd = spawn('/bin/bash', ['-e', path.resolve(`./bash/roll_back_${frontOrBack}.sh`), commitHash])

    // handle stdout. It will be logged in the syslog by systemd.
    cmd.stdout.on('data', data => console.log('Known good %s end commit: %s', frontOrBack, data.toString()))

	// reject promise. we shouldn't see any stderr output unless something went horribly wrong.
	cmd.stderr.on('data', data => reject(new Error('restore-hash-script-error')))

	// reject promise if the exit code isn't 0. Anything other than 0 is an error, it's a POSIX thing  
	cmd.on('exit', code => (code === 0) ? resolve(code) : reject(code))
  } catch(e) {
    // terrible error. let's make the caller figure it out.
    reject(e)
  }
})

// try to redeploy. If that fails, roll back. If that fails, it will be handled in the callers scope by sending me an email
const redeployOrRollBack = (frontOrBack, commitHash) => new Promise(async (resolve, reject) => {
	try {
      await redeploy(frontOrBack)
      resolve()
	} catch (e) {
      // rejection of the following must be handled in the caller
      await rollBackToHash(frontOrBack, commitHash)
      resolve()
	}
})

module.exports = redeployOrRollBack
