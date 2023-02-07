import fs from "fs"
import path from "path"
import { transformFileSync } from "@babel/core"

import plugin from "@lingui/babel-plugin-extract-messages"

const LOCALE_DIR = "./locale"

const buildDir = path.join(LOCALE_DIR, "_build")

const rmdir = (dir) => {
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
  const transform = (filename) => () => {
    process.env.LINGUI_EXTRACT = "1"
    process.env.LINGUI_CONFIG = path.join(
      __dirname,
      "fixtures",
      "lingui.config.js"
    )
    try {
      return transformFileSync(path.join(__dirname, "fixtures", filename), {
        configFile: false,
        plugins: [
          "@babel/plugin-syntax-jsx",
          [
            "macros",
            {
              // macro plugin uses package `resolve` to find a path of macro file
              // this will not follow jest pathMapping and will resolve path from ./build
              // instead of ./src which makes testing & developing hard.
              // here we override resolve and provide correct path for testing
              resolvePath: (source: string) => require.resolve(source),
            },
          ],
          [
            plugin,
            {
              localeDir: LOCALE_DIR,
            },
          ],
        ],
      })
    } finally {
      process.env.LINGUI_EXTRACT = null
      process.env.LINGUI_CONFIG = null
    }
  }

  if (typeof assertion === "function") {
    it(testName, () => assertion(transform))
  } else {
    it(testName, () => {
      // first run should create all required folders and write messages
      expect(transform(assertion)).not.toThrow()
      // another runs should just write messages
      expect(transform(assertion)).not.toThrow()

      const messages = JSON.parse(
        fs.readFileSync(path.join(buildDir, `${assertion}.json`)).toString()
      )
      expect(messages).toMatchSnapshot()
    })
  }
}

describe("@lingui/babel-plugin-extract-messages", function () {
  beforeAll(() => {
    rmdir(LOCALE_DIR)
  })

  afterAll(() => {
    rmdir(LOCALE_DIR)
  })

  testCase(
    "should raise exception on duplicate id and different defaults",
    (transform) => {
      expect(transform("duplicate-id-valid.js")).not.toThrow()
      expect(transform("duplicate-id.js")).toThrow(/Different defaults/)
    }
  )

  testCase(
    "shouldn't write catalog for files without translatable messages",
    (transform) => {
      expect(transform("empty.js")).not.toThrow()
      expect(fs.existsSync(path.join(buildDir, "empty.js.json"))).toBeFalsy()
    }
  )

  testCase("should preserve path to file inside locale dir", (transform) => {
    expect(transform("deep/all.js")).not.toThrow()
    expect(
      fs.existsSync(path.join(buildDir, "deep", "all.js.json"))
    ).toBeTruthy()
  })

  testCase("should ignore files without lingui import", (transform) => {
    expect(transform("without-lingui.js")).not.toThrow()
    expect(
      fs.existsSync(path.join(buildDir, "without-lingui.js.json"))
    ).toBeFalsy()
  })

  testCase("should handle duplicate ids", "duplicate-id-valid.js")

  testCase(
    "should extract all messages from JSX files",
    "jsx-without-macros.js"
  )

  testCase(
    "should extract all messages from JSX files (macros)",
    "jsx-with-macros.js"
  )

  testCase(
    "should extract Plural messages from JSX files when there's no Trans tag (integration)",
    "jsx-without-trans.js"
  )

  testCase("should extract all messages from JS files", "js-without-macros.js")

  testCase(
    "should extract all messages from JS files (macros)",
    "js-with-macros.js"
  )

  testCase(
    "should extract all messages from JS files (without macros or i18n comments)",
    "js-without-macros-or-comments.js"
  )
})
