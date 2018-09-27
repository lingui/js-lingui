import fs from "fs"
import path from "path"
import extractor from "../src/api/extractors/typescript"
import { removeDirectory } from "../src/api/utils"

const LOCALE_DIR = "./locale"

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
    removeDirectory(LOCALE_DIR)
  })

  afterAll(() => {
    removeDirectory(LOCALE_DIR)
  })

  beforeEach(() => {
    process.env.LINGUI_EXTRACT = "1"
  })

  afterEach(() => {
    process.env.LINGUI_EXTRACT = null
  })

  it("should extract Typescript file", function() {
    expect(() =>
      extractor.extract(
        path.join(__dirname, "./fixtures/typescript/core.ts"),
        LOCALE_DIR
      )
    ).not.toThrow()

    const contents = fs.readFileSync(
      path.join(buildDir, "core.ts.json"),
      "utf8"
    )
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

    const contents = fs.readFileSync(
      path.join(buildDir, "react.tsx.json"),
      "utf8"
    )
    const messages = JSON.parse(contents)
    expect(Object.keys(messages).length).toBe(13)
  })
})
