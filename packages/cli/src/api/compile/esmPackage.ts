import fs from "fs"
import nodepath from "path"
import normalizePath from "normalize-path"

/**
 * The package.json that decides how Node loads `file` is the nearest one above
 * it. Returns that package.json's path when it sets `"type": "module"`, and
 * undefined when it does not or when there is none.
 */
export function findEsmPackageJson(file: string): string | undefined {
  let dir = nodepath.dirname(nodepath.resolve(file))

  while (true) {
    const candidate = nodepath.join(dir, "package.json")

    if (fs.existsSync(candidate)) {
      try {
        const { type } = JSON.parse(fs.readFileSync(candidate, "utf8"))
        return type === "module" ? candidate : undefined
      } catch {
        return undefined
      }
    }

    const parent = nodepath.dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

/**
 * One warning for each `"type": "module"` package that compiled catalogs in the
 * `cjs` namespace would land in. Node treats a `.js` file there as an ES
 * module, so the `module.exports=` that `cjs` writes fails to load.
 */
export function getCjsInEsmPackageWarnings(
  compiledFiles: string[],
  rootDir: string,
): string[] {
  const packages = new Map<string, string>()

  for (const file of compiledFiles) {
    const packageJson = findEsmPackageJson(file)
    if (packageJson && !packages.has(packageJson)) {
      packages.set(packageJson, file)
    }
  }

  const relative = (path: string) =>
    normalizePath(nodepath.relative(rootDir, path))

  return [...packages].map(
    ([packageJson, file]) =>
      `Warning: ${relative(packageJson)} has "type": "module", so Node loads ${relative(file)} as an ES module, ` +
      `but the "cjs" namespace writes module.exports into it. ` +
      `Set compileNamespace to "es" or "ts" in your Lingui config, or pass --namespace es.`,
  )
}
