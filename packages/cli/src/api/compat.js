import chalk from "chalk"

function catchBabelVersionMismatch(fn) {
  return function() {
    try {
      fn.apply(null, arguments)
    } catch (e) {
      let logged = false

      if (
        e.message.startsWith(
          "Plugin/Preset files are not allowed to export objects"
        )
      ) {
        logged = true

        const { makeInstall } = require("../lingui-init")
        const install = makeInstall()
        console.log(chalk.red("Please install missing Babel 6 core package:"))
        console.log()
        console.log(install("babel-core@^6.0.0", true))
        console.log()
      } else if (
        e.message.startsWith(
          'Requires Babel "^7.0.0-0", but was loaded with "6.26.3".'
        )
      ) {
        logged = true

        const { makeInstall } = require("../lingui-init")
        const install = makeInstall()
        console.log(chalk.red("Please install missing Babel 7 core packages:"))
        console.log()
        console.log(install("babel-core@^7.0.0-bridge.0 @babel/core", true))
        console.log()
      }

      if (logged) {
        console.log("Original error:")
        console.log(e)
        process.exit(1)
      } else {
        throw e
      }
    }
  }
}

function getBabelCoreFn(fnName) {
  return function() {
    const options = { ...arguments[1] }
    const { babelVersion } = options
    let core = null

    if (babelVersion === 6) {
      try {
        core = require("babel-core")
      } catch (e) {
        console.log(
          chalk.red(
            "Babel 6 was requested in extractBabelVersion but no babel-core installed"
          )
        )
        console.log(install("babel-core", true))
        process.exit(1)
      }
    }

    if (babelVersion === 7) {
      try {
        core = require("@babel/core")
      } catch (e) {
        console.log(
          chalk.red(
            "Babel 7 was requested in extractBabelVersion but no @babel/core installed"
          )
        )
        console.log(install("@babel/core", true))
        process.exit(1)
      }
    }

    if (core === null) {
      console.log(
        chalk.red("Incorrect version of babel specified in extractBabelVersion")
      )
      process.exit(1)
    }

    delete options.babelVersion
    const newArguments = [...arguments]
    newArguments[1] = options
    return core[fnName].apply(null, newArguments)
  }
}

export const transform = catchBabelVersionMismatch(getBabelCoreFn("transform"))
export const transformFileSync = catchBabelVersionMismatch(
  getBabelCoreFn("transformFileSync")
)
