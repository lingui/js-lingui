const fs = require("fs-extra")
const { execSync } = require("child_process")

async function main() {
  const packageJson = await fs.readJson("package.json")
  const { version } = packageJson

  execSync(`git add package.json`)
  execSync(`git commit -m 'chore: Release version ${version}'`)
  execSync(`git tag v${version}`)
}

main()
