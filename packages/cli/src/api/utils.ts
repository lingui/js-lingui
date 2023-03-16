import fs from "fs"
import path from "path"
import normalize from "normalize-path"

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

export const splitOrigin = (origin: string) => {
  const [file, line] = origin.split(":")
  return [file, line ? Number(line) : null] as [file: string, line: number]
}

export const joinOrigin = (origin: [file: string, line?: number]): string =>
  origin.join(":")

export async function readFile(fileName: string): Promise<string | undefined> {
  try {
    return (await fs.promises.readFile(fileName)).toString()
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
  await fs.promises.writeFile(fileName, content)
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

export function makeInstall() {
  const withYarn = hasYarn()

  return (packageName: string, dev: boolean = false) =>
    withYarn
      ? `yarn add ${dev ? "--dev " : ""}${packageName}`
      : `npm install ${dev ? "--save-dev" : "--save"} ${packageName}`
}

/**
 * Normalize Windows backslashes in path so they look always as posix
 */
export function normalizeSlashes(path: string) {
  return path.replace("\\", "/")
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
    return normalize(sourcePath, false)
  }

  // https://github.com/lingui/js-lingui/issues/809
  const isDir = isDirectory(sourcePath)

  return (
    normalize(path.relative(process.cwd(), sourcePath), false) +
    (isDir ? "/" : "")
  )
}
