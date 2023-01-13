const Table = require("cli-table")
const filesize = require("filesize")
const chalk = require("chalk")
const join = require("path").join
const fs = require("fs")
const prevBuildResults = require("./results.json")

export const currentBuildResults = {
  // Mutated during the build.
  bundleSizes: Object.assign({}, prevBuildResults.bundleSizes)
}

export function saveResults() {
  fs.writeFileSync(
    join("scripts", "build", "results.json"),
    JSON.stringify(currentBuildResults, null, 2)
  )
}

function percentChange(prev, current) {
  const change = Math.floor((current - prev) / prev * 100)

  if (change > 0) {
    return chalk.red.bold(`+${change} %`)
  } else if (change <= 0) {
    return chalk.green.bold(change + " %")
  }
}

export function printResults() {
  const table = new Table({
    head: [
      chalk.gray.yellow("Bundle"),
      chalk.gray.yellow("Prev Size"),
      chalk.gray.yellow("Current Size"),
      chalk.gray.yellow("Diff"),
      chalk.gray.yellow("Prev Gzip"),
      chalk.gray.yellow("Current Gzip"),
      chalk.gray.yellow("Diff")
    ]
  })
  Object.keys(currentBuildResults.bundleSizes).forEach(key => {
    const result = currentBuildResults.bundleSizes[key]
    const prev = (prevBuildResults.bundleSizes || {})[key]
    if (result === prev) {
      // We didn't rebuild this bundle.
      return
    }

    const size = result.size
    const gzip = result.gzip
    let prevSize = prev ? prev.size : 0
    let prevGzip = prev ? prev.gzip : 0
    table.push([
      chalk.white.bold(key),
      chalk.gray.bold(filesize(prevSize)),
      chalk.white.bold(filesize(size)),
      prevSize ? percentChange(prevSize, size) : "N/A",
      chalk.gray.bold(filesize(prevGzip)),
      chalk.white.bold(filesize(gzip)),
      prevGzip ? percentChange(prevGzip, gzip) : "N/A"
    ])
  })
  return table.toString()
}
