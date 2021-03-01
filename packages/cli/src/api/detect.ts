import fs from "fs"
import pkgUp from "pkg-up"

export const projectType = {
  CRA: "CRA",
  REACT: "REACT",
}

function getPackageJson() {
  const packageJsonPath = pkgUp.sync()

  try {
    const json = fs.readFileSync(packageJsonPath, "utf8")
    return JSON.parse(json)
  } catch (e) {
    console.error(e)
    return null
  }
}

function hasDependency(pkg, name) {
  return (
    (pkg.dependencies && pkg.dependencies[name]) ||
    (pkg.devDependencies && pkg.devDependencies[name])
  )
}

function detectFramework(pkg) {
  if (hasDependency(pkg, "react-scripts")) {
    return projectType.CRA
  }

  if (hasDependency(pkg, "react")) {
    return projectType.REACT
  }

  return null
}

export function detect() {
  const pkg = getPackageJson()
  if (!pkg) return null

  return detectFramework(pkg)
}
