const path = require('path')
const sendErrorEmail = require(path.resolve('./customUtils/errorEmail.js'))

const errorHandlers = {

  async unforseen(eventPath, knownGoodHash, error) {
    // For errors that shouldnt be able to happen
    const errorString = `Severe unforseen build/deploy error! Manual intervention required. ${eventPath}, last known good commit ${knownGoodHash}`
    console.error(new Error(errorString))
    console.error(error)
    await sendErrorEmail(errorString)
    process.exit(1)
  },

  async commitHash(eventPath) {
    // couldn't get last known good hash, unsafe to proceed
    const errorString = `Couldn't get last known good hash, unsafe to proceed: ${eventPath}`
    console.error(new Error(errorString))
    console.error(e)
    await sendErrorEmail(errorString)
    process.exit(1)
  },

  async redeploy(eventPath, knownGoodHash) {
    const errorString = `Deploy failure, rollback appears successful. ${eventPath}, last known good commit ${knownGoodHash}`
    console.error(new Error(errorString))
    await sendErrorEmail(errorString)
  },

  async rollback(eventPath, knownGoodHash) {
    // Both redeploy and rollback failed. Sends an email and exits.
    const errorString = `Deploy failure and rollback failure. Manual intervention required. ${eventPath}, last known good commit ${knownGoodHash}`
    console.error(new Error(errorString))
    // sendErrorEmail returns a promise that shouldn't ever reject. It will however resolve(false) if the POST fails
    await sendErrorEmail(errorString)
    process.exit(1)
  } 
}

module.exports = errorHandlers
