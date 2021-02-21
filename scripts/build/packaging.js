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

const { UNIVERSAL, NODE, NOOP, ESM } = Bundles.bundleTypes

function getPackageName(name) {
  return name.split("/", 2).reverse()[0]
}

function getBundleOutputPaths(bundleType, filename, packageName) {
  const name = getPackageName(packageName)
  const _filename = filename.replace(/^@lingui\//, "")

  switch (bundleType) {
    case NOOP:
    case NODE:
      return [`packages/${name}/build/${_filename}`]
    case ESM:
      return [`packages/${name}/build/esm/${_filename}`]
    case UNIVERSAL:
      return [`packages/${name}/build/cjs/${_filename}`]
    // case UMD_DEV:
    // case UMD_PROD:
    //   return [
    //     `packages/build/${packageName}/umd/${filename}`,
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
    dest: `packages/${packageName}/build`,
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
  if (!existsSync(`packages/${name}/build`)) {
    // We didn't build any npm packages.
    return
  }

  await Promise.all([
    asyncCopyTo("LICENSE", `packages/${name}/build/LICENSE`),
    asyncCopyTo(
      `packages/${name}/package.json`,
      `packages/${name}/build/package.json`
    ),
    asyncCopyTo(
      `packages/${name}/README.md`,
      `packages/${name}/build/README.md`
    ),
    asyncCopyTo(`packages/${name}/npm`, `packages/${name}/build/`)
  ])
  const tgzName = (await asyncExecuteCommand(
    `npm pack packages/${name}/build`
  )).trim()
  await asyncRimRaf(`packages/${name}/build/`)
  await asyncExtractTar(getTarOptions(tgzName, name))
  unlinkSync(tgzName)
}

async function prepareNpmPackages() {
  const builtPackageFolders = readdirSync("packages/").filter(
    dir => dir.charAt(0) !== "."
  )

  await Promise.all(builtPackageFolders.map(prepareNpmPackage))
}

module.exports = {
  getPackageName,
  getBundleOutputPaths,
  prepareNpmPackages
}
