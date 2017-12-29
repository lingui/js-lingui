#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync, exec, spawn, spawnSync } = require('child_process')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify

exports = module.exports = {}

const PACKAGE_DIR = exports.PACKAGE_DIR = './packages'

exports.getPackages = (packageDir = PACKAGE_DIR) => {
  return fs.readdirSync(packageDir)
    .map(dirName => {
      // Get path of package.json relative to this script, so it can be imported
      const pkgFilePath = path.relative(
        __dirname,
        path.resolve(path.join(packageDir, dirName, 'package.json'))
      )

      try {
        return require(pkgFilePath)
      } catch (e) {
        return false
      }
    })
    .filter(Boolean)
    .reduce((acc, config) => {
      acc[config.name] = config
      return acc
    }, {})
}

exports.getInternalDependencies = (pkgFiles) => {
  const packageNames = Object.keys(pkgFiles)
  return packageNames
    .map(packageName => {
      const info = pkgFiles[packageName]
      const dependencies = Object.keys(Object.assign({},
        info.dependencies,
        info.devDependencies
      ))
        .filter(dependency => packageNames.includes(dependency))

      return {
        name: packageName,
        private: !!pkgFiles[packageName].private,
        dependencies
      }
    })
    .reduce((acc, pkgInfo) => {
      acc[pkgInfo.name] = pkgInfo
      return acc
    }, {})
}

exports.sortByDependencies = (packages) => {
  const orderedPackages = []

  let remainingPackages = Object.keys(packages)

  while (remainingPackages.length) {
    const missingDeps = remainingPackages.filter((name, index) => {
      const { dependencies } = packages[name]
      if (
        !dependencies.length ||
        dependencies.filter(depName => orderedPackages.includes(depName)).length === dependencies.length
      ) {
        orderedPackages.push(name)
        return false
      }

      return true
    })

    if (missingDeps.length === remainingPackages.length) {
      throw new Error('Circular dependency')
    }

    remainingPackages = missingDeps
  }

  return orderedPackages.map(name => packages[name])
}
