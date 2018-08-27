import fs from "fs"
import path from "path"
import chalk from "chalk"

export function removeDirectory(dir, keep = false) {
  if (!fs.existsSync(dir)) return
  const list = fs.readdirSync(dir)

  for (let i = 0; i < list.length; i++) {
    const filename = path.join(dir, list[i])
    const stat = fs.statSync(filename)

    if (filename === "." || filename === "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      removeDirectory(filename)
    } else {
      fs.unlinkSync(filename)
    }
  }

  if (!keep) {
    fs.rmdirSync(dir)
  }
}

export function prettyOrigin(origins) {
  try {
    return origins.map(origin => origin.join(":")).join(", ")
  } catch (e) {
    return ""
  }
}

export const splitOrigin = origin => origin.split(":")

export const joinOrigin = origin => origin.join(":")
