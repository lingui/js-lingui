#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync, exec, spawn, spawnSync } = require('child_process')
const tmp = require('tmp')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify

const { PACKAGE_DIR, getPackages, getInternalDependencies, sortByDependencies } = require('./discover')

const isPrerelease = process.argv.includes('--pre')
const pre = isPrerelease ? 'pre' : ''

// map of package versions: packageName -> version
// Global variable is ugly, but I'm not in state of mind to write a better code
const versions = {}

function log(msg, end = '\n') {
  process.stdout.write(msg + end)
}

function runCmd(cmd, defaults = {}) {
  let ret
  const options = Object.assign({}, defaults, {
    stdio: ['ignore', 'pipe', 'ignore']
  })
  try {
    ret = execSync(cmd, options).toString().trim()
  } catch (e) {
  }

  return ret
}

function runCmdLocal(cwd) {
  return (cmd) => runCmd(cmd, { cwd })
}

function checkUpdates(packageInfo) {
  let latest = false
  try {
    latest = runCmd(`git tag --sort=-committerdate -l ${packageInfo.name}@* | head -n1`)
  } catch (e) {
  }

  if (latest) {
    log(packageInfo.name, '')
    const packageDir = path.join(PACKAGE_DIR, packageInfo.name)
    const history = runCmd(`git log ${latest}.. --pretty=format:'%s%n%b' -- ${packageDir}`)

    const changes = (
      history.split('\n')
        .map(line => {
          if (line.includes('BREAKING CHANGE')) return 'major'
          return line.replace(/^(\w+)(\([^)]*\))?:.*$/, "$1")
        })
        .filter(change => ['major', 'feat', 'fix'].includes(change))
    )

    if (changes.length) {
      return updatePackage(packageInfo, changes)
    } else {
      log('\r\x1b[K', '')
    }
  }
}

function updatePackage(packageInfo, changes) {
  const packageDir = path.join(PACKAGE_DIR, packageInfo.name)
  const pkgFilePath = path.relative(
    __dirname, path.resolve(path.join(packageDir, 'package.json')))
  const runLocal = runCmdLocal(packageDir)

  if (packageInfo.private) {
    log(chalk.yellow(` (skipping private package)`))
    return
  }

  const dependencyMajor = packageInfo.dependencies
    .map(name => versions[name] && versions[name].major)
    .reduce((any, isMajor) => any || isMajor, false)

  const major = changes.includes('major') || dependencyMajor
  const change = major
    ? `${pre}major`
    : changes.includes('feat')
      ? `${pre}minor`
      : `${pre}patch`

  log(chalk.yellow(` (${change} release)`))

  log('Releasing ', '')

  updateDependencies(packageInfo)

  const oldVersion = require(pkgFilePath).version
  const prerelease = oldVersion.includes('-')

  const newVersion = runLocal(`npm version ${prerelease ? 'prerelease' : change}`).slice(1)
  versions[packageInfo.name] = {
    version: newVersion,
    major
  }

  log(chalk.yellow(`v${oldVersion} => v${newVersion}`))

  return `${packageInfo.name}@${newVersion}`
}

function updateDependencies(packageInfo) {
  if (!packageInfo.dependencies.length) return

  const packageFile = path.join(PACKAGE_DIR, packageInfo.name, 'package.json')
  const config = JSON.parse(fs.readFileSync(packageFile))

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies']
  packageInfo.dependencies.forEach(name => {
    depTypes.forEach(depType => {
      if (!config[depType] || !versions[name]) return

      if (config[depType][name]) {
        config[depType][name] = `^${versions[name.version]}`
      }
    })
  })

  fs.writeFileSync(packageFile, JSON.stringify(config))
}

async function release() {
  const packages = getPackages()
  const dependencies = sortByDependencies(getInternalDependencies(packages))

  const isStashed = !runCmd('git stash | grep "No local changes"')
  const newVersions = dependencies.map(checkUpdates).filter(Boolean)

  if (!newVersions.length) {
    log('Nothing to do!')
    if (isStashed) runCmd('git stash pop')
    return
  }

  const message = `${pre}release: 

Updated packages:
${newVersions.join('\n')}
`

  const commitMsg = tmp.fileSync()
  fs.writeSync(commitMsg.fd, message)

  spawnSync('git', ['commit', '-a', '-e', '-F', commitMsg.name], {
    stdio: 'inherit'
  })

  commitMsg.removeCallback()

  if (!isPrerelease) {
    newVersions.forEach(version => {
      runCmd(`git tag ${version}`)
    })
  }
  if (isStashed) runCmd('git stash pop')
}


(async function () {
  log(emojify(`:mag:  ${chalk.green('Checking for changes in packages…')}`))
  await release()
  log(emojify(`:sparkles:  ${chalk.green('Done\!')}`))
})()
