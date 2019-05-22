const argv = require("minimist")(process.argv.slice(2))

const { exec: _exec } = require("child_process")
const fs = require("fs-extra")
const path = require("path")
const inquirer = require("inquirer")
const chalk = require("chalk")
const ora = require("ora")
const semver = require("semver")
const R = require("ramda")

const BUILD_DIR = "build/"
const PACKAGES_DIR = "build/packages"

const npmTagForBranch = {
  master: "latest",
  next: "next"
}

async function devRelease() {
  const spinner = ora({
    text: "Building packages"
  })
  spinner.start()
  await exec("yarn release:build")
  // Throw away build stats
  await exec("git checkout -- scripts/build/results.json")

  spinner.text = "Publishing packages"
  await Promise.all(
    getPackages().map(packagePath => {
      return exec(`yalc publish`, { cwd: packagePath })
    })
  )
  spinner.succeed()

  console.log()
  console.log(
    `Done! Run ${chalk.yellow(
      "yalc link @lingui/[package]"
    )} in target project to install development version of package.`
  )
}

async function release() {
  // Check branch: only `master` and `next` branches are allowed to publish releases
  const { stdout: branch } = await exec(
    "git branch | grep \\* | cut -d ' ' -f2"
  )
  const npmTag = npmTagForBranch[branch]
  if (npmTag === undefined)
    console.error(`Release from branch ${branch} isn't supported`)

  // Get the next version
  const { currentVersion, newVersion } = await getNewVersion(npmTag)

  // Check if build dir exists
  let build = false
  if (fs.existsSync(BUILD_DIR)) {
    const { confirmRebuild } = await inquirer.prompt({
      type: "confirm",
      name: "confirmRebuild",
      message:
        "Build directory already exists. Do you want to rebuild all packages?",
      default: true
    })
    build = confirmRebuild
  }

  if (build) {
    await exec("yarn release:build")
  }

  // Set correct version in package.json for all packages
  await preparePackageVersions(newVersion)

  // Don't commit package size stats for pre-releases
  if (npmTag !== "latest") {
    await exec("git checkout -- scripts/build/results.json")
  }

  console.log()
  console.log(chalk.bold("Summary"))
  console.log(chalk.bold("======="))
  console.log()
  console.log(`Branch:  ${chalk.yellow(branch)}`)
  console.log(`NPM tag: ${chalk.yellow(npmTag)}`)
  console.log(
    `Version: ${
      currentVersion !== newVersion ? `${currentVersion} →` : ""
    } ${chalk.yellow(newVersion)}`
  )
  console.log()

  const { confirmGit } = await inquirer.prompt({
    type: "confirm",
    name: "confirmGit",
    message: "Do you want to proceed, commit version and create git tag?",
    default: false
  })
  if (!confirmGit) return

  await exec("git add package.json scripts/build/results.json")
  try {
    await exec(`git commit -m "chore: release v${newVersion}"`)
  } catch (e) {
    console.warn("Nothing to commit, moving on.")
  }
  try {
    await exec(`git tag v${newVersion}`)
  } catch (e) {
    console.warn("Tag already exists, moving it to HEAD.")
    await exec(`git tag -d v${newVersion}`)
    await exec(`git tag v${newVersion}`)
  }

  const { otp, proceed } = await inquirer.prompt([
    {
      type: "input",
      name: "otp",
      message: "Please enter 6-digit OTP token:",
      validate(value) {
        try {
          parseInt(value, 10)
        } catch (e) {
          return false
        }
        return value.length === 6
      }
    },
    {
      type: "expand",
      name: "proceed",
      message: "Proceed to publish packages to NPM?",
      choices: [
        {
          key: "y",
          name: "Yes",
          value: true
        },
        {
          key: "n",
          name: "No",
          value: false
        },
        {
          key: "d",
          name: "Dry run",
          value: "dry"
        }
      ]
    }
  ])
  if (!otp || !proceed) return

  await npmPublish(newVersion, {
    dryRun: proceed === "dry",
    otp,
    next: npmTag !== "latest"
  })
}

async function getNewVersion(npmTag) {
  const { version: currentVersion } = await fs.readJson("package.json")
  const preview = inc => semver.inc(currentVersion, inc)

  let { versionInc } = await inquirer.prompt({
    type: "list",
    name: "versionInc",
    message: "What version you want to release?",
    default: 1,
    choices: [
      {
        value: "current",
        name: `current ${currentVersion}`
      },
      ...(npmTag === "latest"
        ? ["patch", "minor", "major"]
        : ["prerelease", "prepatch", "preminor", "premajor"]
      ).map(value => ({
        value,
        name: `${value} ${preview(value)}`
      })),
      "manual"
    ]
  })

  if (versionInc === "current") {
    return {
      currentVersion,
      newVersion: currentVersion
    }
  } else if (versionInc === "manual") {
    const { manualVersion } = await inquirer.prompt({
      type: "input",
      name: "manualVersion",
      message: "Enter valid semver version:",
      validate(value) {
        return semver.valid(value) !== null
      }
    })

    versionInc = manualVersion
  }

  // Increment version in package.json, but don't commit anything.
  const { stdout: newVersion } = await exec(
    `npm --no-git-tag-version version ${versionInc}`
  )
  return {
    currentVersion,
    newVersion: newVersion.slice(1)
  }
}

async function preparePackageVersions(newVersion) {
  return Promise.all(
    getPackages().map(packagePath => preparePackage(newVersion, packagePath))
  )
}

async function preparePackage(version, packagePath) {
  const packageJsonPath = path.join(packagePath, "package.json")
  const packageJson = await fs.readJson(packageJsonPath)

  packageJson.version = version
  packageJson.dependencies = preparePackageDependencies(
    version,
    packageJson.dependencies
  )
  packageJson.devDependencies = preparePackageDependencies(
    version,
    packageJson.devDependencies
  )

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

function preparePackageDependencies(version, dependencies) {
  if (!dependencies) return

  const updatedDependencies = {}

  Object.keys(dependencies).forEach(dependency => {
    if (dependency.startsWith("@lingui/")) {
      updatedDependencies[dependency] = version
    } else {
      // ignore anything else
      updatedDependencies[dependency] = dependencies[dependency]
    }
  })

  return updatedDependencies
}

async function npmPublish(version, options) {
  const results = await Promise.all(
    getPackages().map(async packagePath => {
      const name = packagePath.split("/").reverse()[0]
      const spinner = ora({
        isEnabled: !process.env.CI,
        text: `Publishing @lingui/${name}@${version}`
      })

      spinner.start()
      try {
        await npmPublishPackage(packagePath, options)
      } catch (e) {
        spinner.fail(`Version ${version} already published!`)
        console.log(e)
        return false
      }
      spinner.succeed()
    })
  )

  if (results.some(R.equals(false))) process.exit(1)
}

async function npmPublishPackage(packagePath, { otp, next, dryRun }) {
  const tags = next ? "--tag next" : ""
  const cmd = `npm publish --access public --otp=${otp} ${tags}`

  if (!dryRun) {
    await exec(cmd, { cwd: packagePath })
  } else {
    console.log(`DRY RUN: ${cmd}`)
  }

  return true
}

function getPackages() {
  return fs
    .readdirSync(PACKAGES_DIR)
    .map(directory => path.join(PACKAGES_DIR, directory))
    .filter(directory => fs.lstatSync(directory).isDirectory())
}

function exec(cmd, options) {
  const _options = {
    env: {
      ...process.env,
      // When this script is run inside `yarn`, yarn sets thenpm_config_registry
      // env var to yarn one and the authentication fails.
      // By overriding it, we force `npm publish` to use npm registry.
      // https://github.com/yarnpkg/yarn/issues/2935#issuecomment-487020430
      npm_config_registry: undefined
    },
    ...options
  }
  return new Promise(function(resolve, reject) {
    _exec(cmd, _options, function(error, stdout, stderr) {
      stdout = stdout.trim()
      stderr = stderr.trim()

      if (error === null) {
        resolve({ stdout, stderr })
      } else {
        reject({ error, stdout, stderr })
      }
    })
  })
}

function main() {
  if (argv.dev) {
    return devRelease()
  } else {
    return release()
  }
}

if (require.main === module) {
  main().catch(error => console.error(error))
}
