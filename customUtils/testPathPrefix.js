// path prefix for bash scripts when testing
// returns an empty string when NODE_ENV !== 'test'

const testPathPrefix = process.env.NODE_ENV === 'test' ? '/test' : '';

module.exports = testPathPrefix;
