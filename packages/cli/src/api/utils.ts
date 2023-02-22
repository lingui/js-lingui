import fs from "fs"
import path from "path"

export function prettyOrigin(origins: [filename: string, line?: number][]) {
  try {
    return origins.map((origin) => origin.join(":")).join(", ")
  } catch (e) {
    return ""
  }
}

export const splitOrigin = (origin: string) => {
  const [file, line] = origin.split(":")
  return [file, line ? Number(line) : null] as [file: string, line: number]
}

export const joinOrigin = (origin: [file: string, line?: number]): string =>
  origin.join(":")

export function writeFileIfChanged(filename: string, newContent: string) {
  if (fs.existsSync(filename)) {
    const raw = fs.readFileSync(filename).toString()
    if (newContent !== raw) {
      fs.writeFileSync(filename, newContent)
    }
  } else {
    fs.writeFileSync(filename, newContent)
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
