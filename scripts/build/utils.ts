import * as fsPromises from "fs/promises"
import * as fs from "fs"
import * as path from "path"
import ncp from "ncp"
import rimraf from "rimraf"

export async function asyncCopyTo(from: string, to: string) {
  if (!fs.existsSync(from)) return

  await asyncMkDirP(path.dirname(to))

  return new Promise<void>((resolve, reject) => {
    ncp(from, to, error => {
      if (error) {
        // Wrap to have a useful stack trace.
        reject(new Error(error))
        return
      }
      resolve()
    })
  })
}

export function asyncMkDirP(filepath: string) {
  return fsPromises.mkdir(filepath, {
    recursive: true
  })
}

export function asyncRimRaf(filepath: string) {
  return new Promise<void>((resolve, reject) =>
    rimraf(filepath, error => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  )
}

export function getPackageDir(packageName: string, ...segments: string[]): string {
  return path.resolve(__dirname, "../../packages", packageName, ...segments);
}
