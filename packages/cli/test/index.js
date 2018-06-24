import fs from "fs"
import path from "path"
import extractor from "../src/api/extractors/typescript"

const LOCALE_DIR = "./locale"

const rmdir = dir => {
  if (!fs.existsSync(dir)) return
  const list = fs.readdirSync(dir)

  for (let i = 0; i < list.length; i++) {
    const filename = path.join(dir, list[i])
    const stat = fs.statSync(filename)

    if (filename === "." || filename === "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename)
    } else {
      // rm fiilename
      fs.unlinkSync(filename)
    }
  }
  fs.rmdirSync(dir)
}

describe("typescript-extractor", function() {
  // CWD is root directory of repository, so origin of all messages is going to
  // relative to root
  const buildDir = path.join(
    LOCALE_DIR,
    "_build",
    "packages",
    "cli",
    "test",
    "fixtures",
    "typescript"
  )

  beforeAll(() => {
    rmdir(LOCALE_DIR)
  })

  afterAll(() => {
    rmdir(LOCALE_DIR)
  })

  it("should extract Typescript file", function() {
    expect(() =>
      extractor.extract(
        path.join(__dirname, "./fixtures/typescript/core.ts"),
        LOCALE_DIR
      )
    ).not.toThrow()

    const contents = fs.readFileSync(path.join(buildDir, "core.json"), "utf8")
    const messages = JSON.parse(contents)
    expect(Object.keys(messages).length).toBe(10)
  })

  it("should extract Typescript JSX file", function() {
    expect(() =>
      extractor.extract(
        path.join(__dirname, "./fixtures/typescript/react.tsx"),
        LOCALE_DIR
      )
    ).not.toThrow()

    const contents = fs.readFileSync(path.join(buildDir, "react.json"), "utf8")
    const messages = JSON.parse(contents)
    expect(Object.keys(messages).length).toBe(13)
  })
})
