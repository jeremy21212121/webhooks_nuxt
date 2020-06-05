const assert = require('assert').strict
const path = require('path')

const pushHandler = require(path.resolve('./handlers/push.js'))

const demoPushEventData = require(path.resolve('./test/data/demoPushEvent.js'))

module.exports = () => {
  describe('pushHandler()', () => {
    describe('Run push handler with demo data:', () => {
      it('Runs happy path without throwing an error', async () => {
        let error = false
        try {
          await pushHandler(demoPushEventData)
        } catch (e) {
          error = e
        }
        assert.equal(error, false)
      })
    })
  })
}
