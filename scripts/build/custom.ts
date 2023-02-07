import { exec } from "child_process"
import { BundleDef } from "./bundles"
import chalk from "chalk"
import ora from "ora"

function asyncExecuteCommand(command: string) {
  return new Promise((resolve, reject) =>
    exec(command, (error, stdout, stderr) => {
      stdout = stdout.trim()
      stderr = stderr.trim()

      if (error) {
        reject({ stdout, stderr })
        return
      }
      resolve({ stdout, stderr })
    })
  )
}

export default async function (bundle: BundleDef) {
  const logKey = chalk.white.bold(bundle.packageName)

  const spinner = ora(logKey).start()

  try {
    await asyncExecuteCommand(bundle.cmd)
  } catch (error) {
    spinner.fail(error.stdout)
    process.exit(1)
  }

  spinner.succeed()
}
