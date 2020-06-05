// Runs bash script at `bash/get_head_commit.sh` to get head commit hash

const spawn = require('child_process').spawn;
const path = require('path');

// prefix for test bash scripts. an empty string if NODE_ENV !== 'test'.
const testPathPrefix = require(path.resolve('./customUtils/testPathPrefix.js'));

const getKnownGoodCommitHash = (directoryPath) => new Promise((resolve, reject) => {
	
  try {

    // bash script basically just runs 'git rev-parse HEAD'
    const cmd = spawn('/bin/bash', ['-e', path.resolve(`.${testPathPrefix}/bash/get_head_commit.sh`), directoryPath])

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

module.exports = getKnownGoodCommitHash;
