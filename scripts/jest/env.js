global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0)
}

const Enzyme = require("enzyme")
const Adapter = require("enzyme-adapter-react-16")
Enzyme.configure({ adapter: new Adapter() })

// weird hack related to use of MockFS module. Jest tries to load jest-util module
// whenever some console output is about to be produced and MockFS prevents it.
console.log()
