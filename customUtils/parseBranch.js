// Gets branch name from ref string.

// A valid ref string has 2 slashes[0], so the ` || '' ` is probably not necessary
// [0] https://developer.github.com/v3/git/refs/#create-a-reference

const parseBranch = (ref) => ref.split('/')[2] || '';

module.exports = parseBranch;
