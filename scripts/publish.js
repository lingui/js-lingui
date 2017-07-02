#!/usr/bin/env node
const path = require('path')
const { execSync } = require('child_process')
const chalk = require('chalk')

const { PACKAGE_DIR, getPackages, getInternalDependencies, sortByDependencies } = require('./discover')

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

function publish (packageInfo) {
  const packageDir = path.join(PACKAGE_DIR, packageInfo.name)
  const pkgFilePath = path.relative(
    __dirname, path.resolve(path.join(packageDir, 'package.json')))
  const runLocal = runCmdLocal(packageDir)

  const version = require(pkgFilePath).version
  if (!version) return

  const prerelease = version.includes('-')
  log(`Publishing ${chalk.yellow(`${packageInfo.name}@${version}`)} ${prerelease ? '(next)' : ''}`)
  runLocal(`npm publish ${prerelease ? '--tag next' : ''}`)
}

const packages = getPackages()
const dependencies = sortByDependencies(getInternalDependencies(packages))

dependencies.forEach(publish)
