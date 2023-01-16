import fs from "fs"
import nodePath from "path"
import pkgUp from "pkg-up"
import cliPackageJson from "../../package.json";

export const projectType = {
  CRA: "CRA",
  REACT: "REACT",
}

type PackageJson = {
  name: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

function getPackageJson(cwd?: string): {path: string, content: PackageJson} {
  const packageJsonPath = pkgUp.sync({
    cwd
  })

  try {
    const json = fs.readFileSync(packageJsonPath, "utf8")
    return {path: packageJsonPath, content: JSON.parse(json)}
  } catch (e) {
    console.error(e)
    return null
  }
}



function hasDependency(pkg: PackageJson, name: string) {
  return (
    (pkg.dependencies && pkg.dependencies[name]) ||
    (pkg.devDependencies && pkg.devDependencies[name])
  )
}

function detectFramework(pkg: PackageJson) {
  if (hasDependency(pkg, "react-scripts")) {
    return projectType.CRA
  }

  if (hasDependency(pkg, "react")) {
    return projectType.REACT
  }

  return null
}

export function detect() {
  let pkg = getPackageJson()

  if (!pkg) return null

  if (pkg.content.name === cliPackageJson.name) {
    pkg = getPackageJson(nodePath.dirname(pkg.path))
  }

  return detectFramework(pkg.content)
}
