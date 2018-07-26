const fs = require("fs-extra")
const path = require("path")
const ora = require("ora")
const { exec } = require("child_process")
const { getVersion } = require("./version")
const R = require("ramda")

const argv = require("minimist")(process.argv.slice(2), {
  alias: { "dry-run": "dryRun" }
})

const PACKAGES_DIR = "build/packages"

function execPromise(cmd, options) {
  return new Promise((resolve, reject) =>
    exec(cmd, options, error => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  )
}

async function releasePackage(version, packagePath) {
  const name = packagePath.split("/").reverse()[0]
  const spinner = ora({
    isEnabled: false,
    text: `Publishing @lingui/${name}@${version}`
  })

  const tags = argv.next ? "--tag next" : ""
  const cmd = `npm publish --access public --otp=${argv.otp} ${tags}`

  spinner.start()
  try {
    await execPromise(!argv.dryRun ? cmd : "sleep 1", {
      cwd: packagePath
    })
  } catch (e) {
    spinner.fail(`Version ${version} already published!`)
    console.log(e)
    return false
  }

  if (argv.dryRun) {
    console.log(`DRY RUN: ${cmd}`)
  }

  spinner.succeed()
  return true
}

async function main() {
  const version = await getVersion(argv.next)

  const results = await Promise.all(
    fs
      .readdirSync(PACKAGES_DIR)
      .map(directory => path.join(PACKAGES_DIR, directory))
      .filter(directory => fs.lstatSync(directory).isDirectory())
      .map(packagePath => releasePackage(version, packagePath))
  )

  if (results.some(R.equals(false))) process.exit(1)
}

main()
