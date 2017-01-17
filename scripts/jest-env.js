/* globals jasmine */
jasmine.VERBOSE = true

var reporters = require('jasmine-reporters')
jasmine.getEnv().addReporter(
  new reporters.JUnitXmlReporter()
)
