#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync, exec, spawn, spawnSync } = require('child_process')
const tmp = require('tmp')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify

const { PACKAGE_DIR, getPackages, getInternalDependencies, sortByDependencies } = require('./discover')

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
    latest = runCmd(`git tag -l ${packageInfo.name}@* | tail -n1`)
  } catch (e) {
  }

  if (latest) {
    log(packageInfo.name, '')
    const packageDir = path.join(PACKAGE_DIR, packageInfo.name)
    const history = runCmd(`git log ${latest}.. --format='%s' -- ${packageDir}`)

    const changes = (
      history.split('\n')
        .map(line => line.replace(/^(\w+)(\([^)]*\))?:.*$/, "$1"))
        .filter(change => ['feat', 'fix'].includes(change))
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
  const runLocal = runCmdLocal(packageDir)

  if (packageInfo.private) {
    log(chalk.yellow(` (skipping private package)`))
    return
  }

  const change = changes.includes('feat') ? 'minor' : 'patch'
  log(chalk.yellow(` (${change} release)`))

  log('Releasing ', '')

  updateDependencies(packageInfo)

  const oldVersion = runLocal(`npm view ${packageInfo.name} version`)

  const newVersion = runLocal(`npm version ${change}`).slice(1)
  versions[packageInfo.name] = newVersion

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
        config[depType][name] = `^${versions[name]}`
      }
    })
  })

  fs.writeFileSync(packageFile, JSON.stringify(config))
}

async function release() {
  const packages = getPackages()
  const dependencies = sortByDependencies(getInternalDependencies(packages))

  runCmd('git stash')
  const newVersions = dependencies.map(checkUpdates).filter(Boolean)

  if (!newVersions.length) {
    log('Nothing to do!')
    runCmd('git stash pop')
    return
  }

  const message = `release: 

Updated packages:
${newVersions.join('\n')}
`

  const commitMsg = tmp.fileSync()
  fs.writeSync(commitMsg.fd, message)

  spawnSync('git', ['commit', '-a', '-e', '-F', commitMsg.name], {
    stdio: 'inherit'
  })

  commitMsg.removeCallback()

  newVersions.forEach(version => {
    runCmd(`git tag ${version}`)
  })
  runCmd('git stash pop')
}


(async function () {
  log(emojify(`:mag:  ${chalk.green('Checking for changes in packages…')}`))
  await release()
  log(emojify(`:sparkles:  ${chalk.green('Done\!')}`))
})()
