import {BundleDef} from "./bundles"
import {asyncMkDirP, getPackageDir} from "./utils"

import {transformFileSync} from '@babel/core'
import fs from "fs";
import path from "path";
import ora from "ora";
import chalk from "chalk";

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

function declarationFinder(typesPath: string[]) {
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

    for (const filePath of files) {
      const outputPath = path.join(packageDir, 'build', filePath)
      const outputDir = path.dirname(outputPath)

      await asyncMkDirP(outputDir)

      if (!filePath.endsWith(".d.ts")) {
        const { code } = transformFileSync(
          path.join(srcDir, filePath),
          {
            configFile: false,
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    node: 14,
                  },
                }
              ],
              "@babel/preset-typescript",
            ],
          }
        )
        fs.writeFileSync(outputPath.replace(/\.ts$/, ".js"), code)
      } else {
        fs.copyFileSync(path.join(packageDir, filePath), path.join(outputDir, filePath))
      }
    }
  } catch (error) {
    spinner.fail()
    throw error
  }

  spinner.succeed()
}
