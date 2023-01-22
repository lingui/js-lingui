const { exec: _exec } = require("child_process")
const chalk = require("chalk")
const ora = require("ora")

async function releaseInVerdaccio() {
  const spinner = ora()

  // Throw away build stats
  spinner.start("Logging in Verdaccio")
  await exec(
    `npx npm-cli-login -u test -p test -e test@test.com -r http://0.0.0.0:4873`
  )
  spinner.succeed()

  spinner.start("Versioning packages")
  const { stdout: actualBranch } = await exec("git rev-parse --abbrev-ref HEAD")
  await exec(
    `npx lerna version patch --exact --no-git-tag-version --force-publish --no-private --no-push --yes --allow-branch ${actualBranch}`
  )
  spinner.succeed()

  spinner.start("Building packages")
  await exec("yarn release:build")
  spinner.succeed()

  spinner.start(
    "Dont't mark files as changed to let publish, but not create a git history"
  )
  await exec("git commit --all -m \"TEMP: verdaccio release\"")

  spinner.succeed()

  spinner.start("Publishing packages to local registry")
  await exec(
    `npx lerna publish from-package --force-publish --no-git-tag-version --no-private --no-push --yes --allow-branch ${actualBranch} --registry="http://0.0.0.0:4873"
  `
  )
  spinner.succeed()

  spinner.start("Reverting the changed files from index")
  await exec("git reset --soft HEAD~1")
  spinner.succeed()

  console.log()
  console.log(
    `Done! Run ${chalk.yellow(
      "npm install --registry http://0.0.0.0:4873 @lingui/[package]"
    )} in target project to install development version of package.`
  )
}

function exec(cmd, options) {
  const _options = {
    env: {
      ...process.env,
    },
    ...options,
  }
  return new Promise(function (resolve, reject) {
    _exec(cmd, _options, function (error, stdout, stderr) {
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
