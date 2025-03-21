import { exec as _exec, ExecOptions } from "child_process"
import ora from "ora"
import chalk from "chalk"

async function releaseInVerdaccio() {
  const spinner = ora()

  // Throw away build stats
  spinner.start("Logging in Verdaccio")
  await exec(
    `npx npm-cli-login -u test -p test -e test@test.com -r http://0.0.0.0:4873`
  )
  spinner.succeed()

  spinner.start("Building packages")
  await exec("yarn release:build")
  spinner.succeed()

  spinner.start("Versioning and Publishing packages to local registry")

  await exec("npm_config_registry=http://0.0.0.0:4873 yarn changeset publish")
  spinner.succeed()

  console.log()
  console.log(
    `Done! Run ${chalk.yellow(
      "npm install --registry http://0.0.0.0:4873 @lingui/[package]"
    )} in target project to install development version of package.`
  )
}

function exec(
  cmd,
  options: ExecOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  const _options = {
    env: {
      ...process.env,
    },
    ...options,
  }
  return new Promise((resolve, reject) => {
    _exec(cmd, _options, (error, stdout, stderr) => {
      stdout = stdout.trim()
      stderr = stderr.trim()

      if (error === null) {
        resolve({ stdout, stderr })
      } else {
        reject({ error, stdout, stderr })
        console.error(stderr)
        process.exit(1)
      }
    })
  })
}

function main() {
  return releaseInVerdaccio()
}

if (require.main === module) {
  main().catch((error) => console.error(error))
}
