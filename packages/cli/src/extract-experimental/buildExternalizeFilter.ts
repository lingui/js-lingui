import fs from "node:fs"

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

function createPackageRegExp(packageName: string) {
  return new RegExp("^" + packageName + "(?:\\/.+)?")
}

function packages(
  packages: Record<string, string>,
  includeDeps: string[]
): RegExp[] {
  return Object.keys(packages || {})
    .filter((packageName) => {
      return !includeDeps.some((incl) => packageName.startsWith(incl))
    })
    .map(createPackageRegExp)
}

export function buildExternalizeFilter({
  includeDeps,
  excludeDeps,
  packageJson,
}: {
  includeDeps: string[]
  excludeDeps: string[]
  packageJson: PackageJson
}) {
  const external = [
    ...packages(packageJson.dependencies, includeDeps),
    ...packages(packageJson.devDependencies, includeDeps),
    ...packages(packageJson.peerDependencies, includeDeps),
    ...packages(packageJson.optionalDependencies, includeDeps),
    ...excludeDeps.map(createPackageRegExp),
  ]

  return (id: string) =>
    external.some((regExp) => {
      return regExp.test(id)
    })
}

export async function getPackageJson(rootDir: string): Promise<PackageJson> {
  const { default: pkgUp } = await import("pkg-up")
  const packageJsonPath = await pkgUp({
    cwd: rootDir,
  })

  if (!packageJsonPath) {
    throw new Error(
      "We could not able to find your package.json file. " +
        "Check that `rootDir` is pointing to the folder with package.json"
    )
  }

  try {
    return JSON.parse(await fs.promises.readFile(packageJsonPath, "utf-8"))
  } catch (e) {
    throw new Error(
      `Unable to read package.json file at path ${packageJsonPath}. \n\n Error: ${
        (e as Error).message
      }`
    )
  }
}
