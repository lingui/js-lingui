import path from "path"
import { exec as _exec, ExecOptions } from "child_process"
import ora from "ora"

const OPTS: ExecOptions = {
  cwd: path.resolve("examples/create-react-app"),
}

async function main() {
  const spinner = ora()

  await exec("yarn", OPTS)
  spinner.start("Linking create-react-app")
  await exec(
    "npm i -g update-by-scope --registry https://registry.npmjs.org",
    OPTS
  )
  await exec("npm config set registry http://0.0.0.0:4873/", OPTS)
  await exec("update-by-scope @lingui", OPTS)
  spinner.succeed("Updated @lingui packages")

  spinner.start("Running tests")
  try {
    await exec("yarn test:ci", OPTS)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    process.exit(1)
  }
}

function exec(cmd: string, options: ExecOptions) {
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
        console.error(stdout)
        console.error(stderr)
        console.error(error)
        reject({ error, stdout, stderr })
        process.exit(1)
      }
    })
  })
}

if (require.main === module) {
  main().catch((error) => console.error(error))
}
