#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync, exec, spawn, spawnSync } = require('child_process')
const tmp = require('tmp')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify

const PACKAGE_DIR = './packages'

const packages = [
  'lingui-conf',
  'babel-plugin-lingui-transform-js',
  'babel-plugin-lingui-transform-react',
  'babel-plugin-lingui-extract-messages',
  'lingui-formats',
  'lingui-i18n',
  'lingui-react',
  'lingui-cli'
]

function log(msg = '\n') {
  process.stdout.write(msg)
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

function checkUpdates(packageName) {
  let latest = false
  try {
    latest = runCmd(`git describe --tags --abbrev=0 --match ${packageName}@*`)
  } catch (e) {
  }

  if (latest) {
    process.stdout.write(packageName)
    const packageDir = path.join(PACKAGE_DIR, packageName)
    const history = runCmd(`git log ${latest}.. --format='%s' -- ${packageDir}`)

    const changes = (
      history.split('\n')
        .map(line => line.replace(/^(\w+)(\([^)]*\))?:.*$/, "$1"))
        .filter(change => ['feat', 'fix'].includes(change))
    )

    if (changes.length) {
      return updatePackage(packageName, changes)
    } else {
      process.stdout.write('\r\x1b[K')
    }
  }
}

function updatePackage(packageName, changes) {
  const packageDir = path.join(PACKAGE_DIR, packageName)
  const runLocal = runCmdLocal(packageDir)

  const change = changes.includes('feat') ? 'minor' : 'patch'
  log(chalk.yellow(` (${change} release)\n`))

  log('Upgrading dependencies\n')
  runLocal('yarn upgrade')

  log('Releasing ')
  const oldVersion = runLocal(`npm view ${packageName} version`)
  const newVersion = runLocal(`npm version ${change}`)
  log(chalk.yellow(`v${oldVersion} => ${newVersion}\n`))

  log('Publishing to NPM\n')
  runLocal('npm publish')
  log()

  return `${packageName}@${newVersion}`
}

async function release() {
  runCmd('git stash')
  const newVersions = packages.map(checkUpdates).filter(Boolean)

  if (!newVersions.length) {
    log('Nothing to do!\n')
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
  console.log(emojify(`:mag:  ${chalk.green('Checking for changes in packages…')}`))
  await release()
  console.log(emojify(`:sparkles:  ${chalk.green('Done\!')}`))
})()
