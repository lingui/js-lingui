import path from "path"
/**
 * Fellow contributor!
 * *Never* import `extract` module outsite `it` or `beforeAll`. It would
 * break mocking of extractors in `extract` test suit.
 */
import mockFs from "mock-fs"

describe("extract", function () {
  let extract, babel, typescript

  beforeAll(() => {

    // References to the real match functions
    const babelMatch = require("./extractors/babel").default.match
    const tsMatch = require("./extractors/typescript").default.match

    jest.doMock("./extractors/babel", () => ({
      match: jest.fn(babelMatch),
      extract: jest.fn(),
    }))

    jest.doMock("./extractors/typescript", () => ({
      match: jest.fn(tsMatch),
      extract: jest.fn(),
    }))

    // load before mocking FS
    extract = require("./extract").extract
    babel = require("./extractors/babel")
    typescript = require("./extractors/typescript")

    mockFs({
      src: {
        "index.html": "",

        components: {
          "Babel.js": "",
          "Babel.jsx": "",
          "Babel.es6": "",
          "Babel.es": "",
          "Babel.mjs": "",
          "Typescript.ts": "",
          forbidden: {
            "apple.js": "",
          },
        },

        forbidden: {
          "file.js": "",
        },
      },
    })
  })

  afterAll(() => {
    mockFs.restore()
  })

  it("should traverse directory and call extractors", function () {
    extract(["src"], "locale", {
      ignore: ["forbidden"],
      babelOptions: {},
    })

    expect(typescript.match).toHaveBeenCalledWith(
      path.join("src", "components", "Typescript.ts")
    )
    expect(babel.match).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.js")
    )
    expect(babel.match).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.jsx")
    )
    expect(babel.match).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.es6")
    )
    expect(babel.match).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.es")
    )
    expect(babel.match).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.mjs")
    )
		
    expect(babel.match).toHaveBeenCalledWith(
			path.join("src", "index.html")
    )

    // This file is ignored
    expect(babel.extract).not.toHaveBeenCalledWith(
      path.join("src", "index.html")
    )

    const extractArgs = [
      "locale", 
      { babelOptions: {}, ignore: ["forbidden"]}
    ]
    expect(babel.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.js"),
      ...extractArgs
    )
    expect(babel.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.jsx"),
      ...extractArgs
    )
    expect(babel.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.es6"),
      ...extractArgs
    )
    expect(babel.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.es"),
      ...extractArgs
    )
    expect(babel.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.mjs"),
      ...extractArgs
    )
    expect(babel.extract).not.toHaveBeenCalledWith(
      path.join("src", "components", "Typescript.ts"),
      ...extractArgs
    )

    expect(typescript.extract).not.toHaveBeenCalledWith(
      path.join("src", "components", "Babel.js"),
      ...extractArgs
    )
    expect(typescript.extract).not.toHaveBeenCalledWith(
      path.join("src", "components", "Babel.jsx"),
      ...extractArgs
    )
    expect(typescript.extract).not.toHaveBeenCalledWith(
      path.join("src", "components", "Babel.es6"),
      ...extractArgs
    )
    expect(typescript.extract).not.toHaveBeenCalledWith(
      path.join("src", "components", "Babel.es"),
      ...extractArgs
    )
    expect(typescript.extract).not.toHaveBeenCalledWith(
      path.join("src", "components", "Babel.mjs"),
      ...extractArgs
    )
    expect(typescript.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Typescript.ts"),
      ...extractArgs
    )
  })
})

describe("collect", function () {
  beforeEach(() => {
    mockFs({
      src: {
        components: {
          "Ignore.js": "Messages are collected only from JS files.",
          "Broken.json": "Invalid JSONs are ignored too.",
          "Babel.json": JSON.stringify({
            "Babel Documentation": {
              message: "Babel Documentation",
              origin: [["src/components/Babel.js", 5]],
            },
            Label: {
              message: "Label",
              origin: [["src/components/Babel.js", 7]],
            },
          }),
          "Typescript.json": JSON.stringify({
            "Typescript Documentation": {
              message: "Typescript Documentation",
              origin: [["src/components/Typescript.ts", 5]],
            },
            Label: {
              message: "Label",
              origin: [["src/components/Typescript.ts", 7]],
            },
          }),
        },
      },

      // test case for an error with different defaults
      diffDefaults: {
        "First.js.json": JSON.stringify({
          "msg.id": {
            message: "First default",
            origin: [["diffDefaults/First.js", 2]],
          },
        }),
        "Second.js.json": JSON.stringify({
          "msg.id": {
            message: "Second default",
            origin: [["diffDefaults/Second.js", 5]],
          },
        }),
      },

      // test case for when only one defaults message is specified
      onlyOneDefault: {
        "First.js.json": JSON.stringify({
          "msg.id": {
            origin: [["onlyOneDefault/First.js", 2]],
          },
        }),
        "Second.js.json": JSON.stringify({
          "msg.id": {
            message: "Second default",
            origin: [["onlyOneDefault/Second.js", 5]],
          },
        }),
      },
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("should traverse directory and collect messages", function () {
    const { collect } = require("./extract")
    const catalog = collect("src")
    mockFs.restore()
    expect(catalog).toMatchSnapshot()
  })

  it("should throw an error about different defaults", function () {
    const { collect } = require("./extract")
    try {
      collect("diffDefaults")
    } catch (e) {
      // we have to call mockFs.restore *before* matching with snapshot
      mockFs.restore()
      expect(() => {
        throw e
      }).toThrowErrorMatchingSnapshot()
    }
  })

  it("should use defined default", function () {
    const { collect } = require("./extract")
    const catalog = collect("onlyOneDefault")
    mockFs.restore()
    expect(catalog).toMatchSnapshot()
  })
})
