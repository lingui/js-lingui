import fs from "fs"
import path from "path"
import { transformFileSync } from "babel-core"

import plugin from "@lingui/babel-plugin-extract-messages"

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

function testCase(testName, assertion) {
  const transform = (filename, jsx = true) => () =>
    transformFileSync(path.join(__dirname, "fixtures", filename), {
      babelrc: false,
      plugins: [
        ...(/integration.*\.js$/.test(filename)
          ? jsx
            ? [
                "@lingui/babel-plugin-transform-js",
                "@lingui/babel-plugin-transform-react"
              ]
            : ["@lingui/babel-plugin-transform-js"]
          : []),
        [
          plugin,
          {
            localeDir: LOCALE_DIR
          }
        ],
        ...(jsx ? ["babel-plugin-syntax-jsx"] : [])
      ]
    })

  it(testName, () => assertion(transform))
}

describe("babel-plugin-lingui-extract-messages", function() {
  // CWD is root directory of repository, so origin of all messages is going to
  // relative to root
  const buildDir = path.join(
    LOCALE_DIR,
    "_build",
    "packages",
    "babel-plugin-extract-messages",
    "test",
    "fixtures"
  )

  beforeAll(() => {
    rmdir(LOCALE_DIR)
  })

  afterAll(() => {
    rmdir(LOCALE_DIR)
  })

  testCase(
    "should raise exception on duplicate id and different defaults",
    transform => {
      expect(transform("jsx/duplicate-id-valid.js")).not.toThrow()
      expect(transform("jsx/duplicate-id.js")).toThrow(/Different defaults/)
    }
  )

  testCase(
    "shouldn't write catalog for files without translatable messages",
    transform => {
      expect(transform("empty.js")).not.toThrow()
      expect(fs.existsSync(path.join(buildDir, "empty.js.json"))).toBeFalsy()
    }
  )

  testCase("should preserve path to file inside locale dir", transform => {
    expect(transform("jsx/deep/all.js")).not.toThrow()
    expect(
      fs.existsSync(path.join(buildDir, "jsx", "deep", "all.js.json"))
    ).toBeTruthy()
  })

  testCase("should ignore files without lingui import", transform => {
    expect(transform("jsx/without-lingui.js")).not.toThrow()
    expect(
      fs.existsSync(path.join(buildDir, "jsx", "without-lingui.js.json"))
    ).toBeFalsy()
  })

  testCase("should extract noop strings", transform => {
    const result = transform("noop/actual.js")()

    const expected = fs.readFileSync(
      path.join(__dirname, "fixtures", "noop", "expected.js")
    )
    expect(result.code.replace(/\r/g, "").trim()).toEqual(
      expected
        .toString()
        .replace(/\r/g, "")
        .trim()
    )

    const messages = JSON.parse(
      fs.readFileSync(path.join(buildDir, "noop", "actual.js.json"))
    )
    expect(messages).toMatchSnapshot()
  })

  testCase("should extract all messages from JSX files", transform => {
    // first run should create all required folders and write messages
    expect(transform("jsx/all.js")).not.toThrow()
    // another runs should just write messages
    expect(transform("jsx/all.js")).not.toThrow()

    const messages = JSON.parse(
      fs.readFileSync(path.join(buildDir, "jsx", "all.js.json"))
    )
    expect(messages).toMatchSnapshot()
  })

  testCase(
    "should extract all messages from JSX files (integration)",
    transform => {
      // first run should create all required folders and write messages
      expect(transform("jsx/integration.js")).not.toThrow()
      // another runs should just write messages
      expect(transform("jsx/integration.js")).not.toThrow()

      const messages = JSON.parse(
        fs.readFileSync(path.join(buildDir, "jsx", "integration.js.json"))
      )
      expect(messages).toMatchSnapshot()
    }
  )

  testCase(
    "should extract all messages from JSX files (integration with alises)",
    transform => {
      // first run should create all required folders and write messages
      expect(transform("jsx/integration-with-aliases.js")).not.toThrow()
      // another runs should just write messages
      expect(transform("jsx/integration-with-aliases.js")).not.toThrow()

      const messages = JSON.parse(
        fs.readFileSync(
          path.join(buildDir, "jsx", "integration-with-aliases.js.json")
        )
      )
      expect(messages).toMatchSnapshot()
    }
  )

  testCase("should extract all messages from JS files", transform => {
    // first run should create all required folders and write messages
    expect(transform("js/all.js", false)).not.toThrow()
    // another runs should just write messages
    expect(transform("js/all.js", false)).not.toThrow()

    const messages = JSON.parse(
      fs.readFileSync(path.join(buildDir, "js", "all.js.json"))
    )
    expect(messages).toMatchSnapshot()
  })

  testCase("should extract all messages from JS files (macros)", transform => {
    // first run should create all required folders and write messages
    expect(transform("js/macro.js", false)).not.toThrow()
    // another runs should just write messages
    expect(transform("js/macro.js", false)).not.toThrow()

    const messages = JSON.parse(
      fs.readFileSync(path.join(buildDir, "js", "macro.js.json"))
    )
    expect(messages).toMatchSnapshot()
  })

  testCase(
    "should extract all messages from JS files (integration)",
    transform => {
      // first run should create all required folders and write messages
      expect(transform("js/integration.js", false)).not.toThrow()
      // another runs should just write messages
      expect(transform("js/integration.js", false)).not.toThrow()

      const messages = JSON.parse(
        fs.readFileSync(path.join(buildDir, "js", "integration.js.json"))
      )
      expect(messages).toMatchSnapshot()
    }
  )

  it("should extract JS translations only once inside React components", function() {
    expect(() =>
      transformFileSync(
        path.join(__dirname, "fixtures", "jsx", "with-react.js"),
        {
          babelrc: false,
          plugins: [
            "@lingui/babel-plugin-transform-js",
            "@lingui/babel-plugin-transform-react",
            [
              plugin,
              {
                localeDir: LOCALE_DIR
              }
            ]
          ],
          presets: ["react"]
        }
      )
    ).not.toThrow()

    const messages = JSON.parse(
      fs.readFileSync(path.join(buildDir, "jsx", "with-react.js.json"))
    )
    expect(messages).toMatchSnapshot()
  })
})
