import {existsSync, readdirSync, unlinkSync} from "fs"
import {BundleType as BundleType} from "./bundles"

import {
  asyncCopyTo,
} from "./utils"

export function getBundleOutputPaths(bundleType: BundleType, filename: string, packageName: string) {
  const _filename = filename.replace(/^@lingui\//, "")

  switch (bundleType) {
    case BundleType.NOOP:
    case BundleType.NODE:
      return [`packages/${packageName}/build/${_filename}`]
    case BundleType.ESM:
      return [`packages/${packageName}/build/esm/${_filename}`]
    case BundleType.UNIVERSAL:
      return [`packages/${packageName}/build/cjs/${_filename}`]
    // case BundleType.UMD_DEV:
    // case BundleType.UMD_PROD:
    //   return [
    //     `packages/build/${packageName}/umd/${filename}`,
    //     `build/dist/${filename}`
    //   ]
    default:
      throw new Error("Unknown bundle type.")
  }
}


async function prepareNpmPackage(name: string) {
  if (!existsSync(`packages/${name}/build`)) {
    // We didn't build any npm packages.
    return
  }

  await Promise.all([
    asyncCopyTo("LICENSE", `packages/${name}/build/LICENSE`),
    asyncCopyTo(`packages/${name}/npm`, `packages/${name}/build`)
  ])
}

export async function prepareNpmPackages() {
  const builtPackageFolders = readdirSync("packages/").filter(
    dir => dir.charAt(0) !== "."
  )

  await Promise.all(builtPackageFolders.map(prepareNpmPackage))
}
