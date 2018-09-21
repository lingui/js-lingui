let core
try {
  core = require("babel-core")
} catch (e) {
  core = require("@babel/core")
}

function catchBabelVersionMismatch(fn) {
  return function() {
    try {
      fn.apply(null, arguments)
    } catch (e) {
      if (
        e.message.startsWith(
          "Plugin/Preset files are not allowed to export objects"
        )
      ) {
        console.error("Please install babel-core@6")
      } else {
        throw e
      }
    }
  }
}

export const transform = catchBabelVersionMismatch(core.transform)
export const transformFileSync = catchBabelVersionMismatch(
  core.transformFileSync
)
