import {BundleDef, BundleType} from "./bundles"
import {getBundleOutputPaths} from "./packaging"
import {asyncMkDirP, getPackageDir} from "./utils"

import {transformFileSync} from '@babel/core';
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const ora = require("ora")

const babelConfig = require("./babel.config")

const ignorePatterns = [/\.test.[jt]s$/, /fixtures/]

function walk(base: string, relativePath = ""): string[] {
  let files: string[] = []

  fs.readdirSync(path.join(base, relativePath)).forEach(dirname => {
    const directory = path.join(relativePath, dirname)
    if (fs.lstatSync(path.join(base, directory)).isDirectory()) {
      files = files.concat(walk(base, directory))
    } else if (
      !/\.[jt]s$/.test(directory) ||
      ignorePatterns.some(pattern => pattern.test(directory))
    ) {
      // return
    } else {
      files.push(directory)
    }
  })

  return files
}

function declarationFinder(typesPath) {
  return typesPath.map(p => fs.existsSync(p) && path.basename(p)).filter(Boolean)
}

export default async function(bundle: BundleDef) {
  const logKey = chalk.white.bold(bundle.packageName)

  const spinner = ora(logKey).start()

  try {
    const packageDir = getPackageDir(bundle.packageName)

    const srcDir = path.join(packageDir, "src")
    const files = [
      ...walk(srcDir),
      ...declarationFinder([
        path.join(packageDir, "index.d.ts"),
        path.join(packageDir, "global.d.ts"),
      ])
    ]

    for (const filename of files) {
      const [mainOutputPath] = getBundleOutputPaths(
        BundleType.NODE,
        filename,
        bundle.packageName
      )

      const outputDir = path.dirname(mainOutputPath)
      await asyncMkDirP(outputDir)

      if (!filename.endsWith(".d.ts")) {
        const { code } = transformFileSync(
          path.join(srcDir, filename),
          babelConfig({ modules: true })
        )
        fs.writeFileSync(mainOutputPath.replace(/\.ts$/, ".js"), code)
      } else {
        fs.copyFileSync(path.join(packageDir, filename), path.join(outputDir, filename))
      }
    }
  } catch (error) {
    spinner.fail()
    throw error
  }

  spinner.succeed()
}
