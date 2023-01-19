/**
 * This entry is for old runtimes which do not support `exports` field in package.json
 * https://github.com/facebook/metro/issues/670
 */
module.exports = require("./build/cjs/compile.js")
