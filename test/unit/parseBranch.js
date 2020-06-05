const assert = require('assert').strict
const path = require('path')

const parseBranch = require(path.resolve('./customUtils/parseBranch.js'))

const testRefStrings = [
  {
    ref: 'refs/heads/master',
    branch: 'master'
  },
  {
    ref: 'refs/heads/develop',
    branch: 'develop'
  },
  {
    ref: 'refs/heads/test-repo123',
    branch: 'test-repo123'
  }
]

module.exports = () => {
  describe('parseBranch()', () => {
    describe('Correctly parses test ref strings', () => {
      testRefStrings.forEach(obj => {
        it(`Correctly parsed ${obj.ref}`, () => {
          const result = parseBranch(obj.ref)
          assert.strictEqual(result, obj.branch)
        })
      })
    })
  })
}