import { existsSync, readdirSync } from "fs"

import { asyncCopyTo } from "./utils"

async function prepareNpmPackage(name: string) {
  if (!existsSync(`packages/${name}/build`)) {
    // We didn't build any npm packages.
    return
  }

  await Promise.all([
    asyncCopyTo("LICENSE", `packages/${name}/build/LICENSE`),
    asyncCopyTo(`packages/${name}/npm`, `packages/${name}/build`),
  ])
}

export async function prepareNpmPackages() {
  const builtPackageFolders = readdirSync("packages/").filter(
    (dir) => dir.charAt(0) !== "."
  )

  await Promise.all(builtPackageFolders.map(prepareNpmPackage))
}
