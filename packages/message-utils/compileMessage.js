/**
 * this file is a workaround for older runtimes
 * such as React Native or Jest 27 which is not
 * support package.json exports field
 **/
module.exports = require("./dist/compileMessage.cjs")
