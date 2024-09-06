import fs from "fs"
import path from "path"
import normalizePath from "normalize-path"

export const PATHSEP = "/" // force posix everywhere

export function prettyOrigin(origins: [filename: string, line?: number][]) {
  try {
    return origins.map((origin) => origin.join(":")).join(", ")
  } catch (e) {
    return ""
  }
}

export function replacePlaceholders(
  input: string,
  values: Record<string, string>
): string {
  return input.replace(/\{([^}]+)}/g, (m, placeholder) => {
    return values[placeholder] ?? m
  })
}

export async function readFile(fileName: string): Promise<string | undefined> {
  try {
    return (await fs.promises.readFile(fileName, "utf-8")).toString()
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code != "ENOENT") {
      throw err
    }
  }
}

async function mkdirp(dir: string): Promise<void> {
  try {
    await fs.promises.mkdir(dir, {
      recursive: true,
    })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code != "EEXIST") {
      throw err
    }
  }
}

export function isDirectory(filePath: string) {
  try {
    return fs.lstatSync(filePath).isDirectory()
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code != "ENOENT") {
      throw err
    }
  }
}

export async function writeFile(
  fileName: string,
  content: string
): Promise<void> {
  await mkdirp(path.dirname(fileName))
  await fs.promises.writeFile(fileName, content, "utf-8")
}

export async function writeFileIfChanged(
  filename: string,
  newContent: string
): Promise<void> {
  const raw = await readFile(filename)

  if (raw) {
    if (newContent !== raw) {
      await writeFile(filename, newContent)
    }
  } else {
    await writeFile(filename, newContent)
  }
}

export function hasYarn() {
  return fs.existsSync(path.resolve("yarn.lock"))
}

export function makeInstall(packageName: string, dev: boolean = false) {
  const withYarn = hasYarn()

  return withYarn
    ? `yarn add ${dev ? "--dev " : ""}${packageName}`
    : `npm install ${dev ? "--save-dev" : "--save"} ${packageName}`
}

/**
 * Remove ./ at the beginning: ./relative  => relative
 *                             relative    => relative
 * Preserve directories:       ./relative/ => relative/
 * Preserve absolute paths:    /absolute/path => /absolute/path
 */
export function normalizeRelativePath(sourcePath: string): string {
  if (path.isAbsolute(sourcePath)) {
    // absolute path
    return normalizePath(sourcePath, false)
  }

  // https://github.com/lingui/js-lingui/issues/809
  const isDir = isDirectory(sourcePath)

  return (
    normalizePath(path.relative(process.cwd(), sourcePath), false) +
    (isDir ? "/" : "")
  )
}

/**
 * Escape special regex characters used in file-based routing systems
 */
export function makePathRegexSafe(path: string) {
  return path.replace(/[(){}[\]^$+]/g, "\\$&")
}
