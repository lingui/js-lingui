import os from "os"
import fs from "fs-extra"
import path from "path"

export function copyFixture(fixtureDir) {
  const tmpDir = path.join(os.tmpdir(), `lingui-test-${process.pid}`)

  if (!fs.existsSync(fixtureDir)) {
    fs.mkdirpSync(tmpDir)
  } else {
    fs.copySync(fixtureDir, tmpDir)
  }
  return tmpDir
}
