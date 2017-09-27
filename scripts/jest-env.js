/* globals jasmine */
jasmine.VERBOSE = true

var reporters = require('jasmine-reporters')
jasmine.getEnv().addReporter(
  new reporters.JUnitXmlReporter()
)

global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

const Enzyme = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
Enzyme.configure({ adapter: new Adapter() });
