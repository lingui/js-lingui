"use strict"

const { existsSync, readdirSync, unlinkSync } = require("fs")
const path = require("path")
const Bundles = require("./bundles")
const {
  asyncCopyTo,
  asyncExecuteCommand,
  asyncExtractTar,
  asyncRimRaf
} = require("./utils")

const { UNIVERSAL, NODE, NOOP } = Bundles.bundleTypes

function getPackageName(name) {
  return name.split("/", 2).reverse()[0]
}

function getBundleOutputPaths(bundleType, filename, packageName) {
  const name = getPackageName(packageName)

  switch (bundleType) {
    case NOOP:
    case NODE:
      return [`build/packages/${name}/${filename}`]
    case UNIVERSAL:
      return [`build/packages/${name}/cjs/${filename}`]
    // case UMD_DEV:
    // case UMD_PROD:
    //   return [
    //     `build/packages/${packageName}/umd/${filename}`,
    //     `build/dist/${filename}`
    //   ]
    default:
      throw new Error("Unknown bundle type.")
  }
}

function getTarOptions(tgzName, packageName) {
  // Files inside the `yarn pack`ed archive start
  // with "package/" in their paths. We'll undo
  // this during extraction.
  const CONTENTS_FOLDER = "package"
  return {
    src: tgzName,
    dest: `build/packages/${packageName}`,
    tar: {
      entries: [CONTENTS_FOLDER],
      map(header) {
        if (header.name.indexOf(CONTENTS_FOLDER + "/") === 0) {
          header.name = header.name.substring(CONTENTS_FOLDER.length + 1)
        }
      }
    }
  }
}

async function prepareNpmPackage(name) {
  await Promise.all([
    asyncCopyTo("LICENSE", `build/packages/${name}/LICENSE`),
    asyncCopyTo(
      `packages/${name}/package.json`,
      `build/packages/${name}/package.json`
    ),
    asyncCopyTo(
      `packages/${name}/README.md`,
      `build/packages/${name}/README.md`
    ),
    asyncCopyTo(`packages/${name}/npm`, `build/packages/${name}`)
  ])
  const tgzName = (await asyncExecuteCommand(
    `npm pack build/packages/${name}`
  )).trim()
  await asyncRimRaf(`build/packages/${name}`)
  await asyncExtractTar(getTarOptions(tgzName, name))
  unlinkSync(tgzName)
}

async function prepareNpmPackages() {
  if (!existsSync("build/packages")) {
    // We didn't build any npm packages.
    return
  }
  const builtPackageFolders = readdirSync("build/packages").filter(
    dir => dir.charAt(0) !== "."
  )
  await Promise.all(builtPackageFolders.map(prepareNpmPackage))
}

module.exports = {
  getPackageName,
  getBundleOutputPaths,
  prepareNpmPackages
}
