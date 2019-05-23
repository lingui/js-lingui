import path from "path"
/**
 * Fellow contributor!
 * *Never* import `extract` module outsite `it` or `beforeAll`. It would
 * break mocking of extractors in `extract` test suit.
 */
import mockFs from "mock-fs"

describe("extract", function() {
  let extract, babel, typescript

  beforeAll(() => {
    jest.doMock("./extractors/babel", () => ({
      match: jest.fn(filename => filename.endsWith(".js")),
      extract: jest.fn()
    }))

    jest.doMock("./extractors/typescript", () => ({
      match: jest.fn(filename => filename.endsWith(".ts")),
      extract: jest.fn()
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
          "Typescript.ts": "",
          forbidden: {
            "apple.js": ""
          }
        },

        forbidden: {
          "file.js": ""
        }
      }
    })
  })

  afterAll(() => {
    mockFs.restore()
  })

  it("should traverse directory and call extractors", function() {
    extract(["src"], "locale", {
      ignore: ["forbidden"],
      babelOptions: {}
    })

    expect(typescript.match).toHaveBeenCalledWith(
      path.join("src", "components", "Typescript.ts")
    )
    expect(babel.match).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.js")
    )
    expect(babel.match).toHaveBeenCalledWith(path.join("src", "index.html"))

    // This file is ignored
    expect(babel.extract).not.toHaveBeenCalledWith(
      path.join("src", "index.html")
    )

    expect(babel.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.js"),
      "locale",
      { babelOptions: {}, ignore: ["forbidden"] }
    )
    expect(babel.extract).not.toHaveBeenCalledWith(
      path.join("src", "components", "Typescript.ts"),
      "locale",
      { babelOptions: {}, ignore: ["forbidden"] }
    )

    expect(typescript.extract).not.toHaveBeenCalledWith(
      path.join("src", "components", "Babel.js"),
      "locale",
      { babelOptions: {}, ignore: ["forbidden"] }
    )
    expect(typescript.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Typescript.ts"),
      "locale",
      { babelOptions: {}, ignore: ["forbidden"] }
    )
  })
})

describe("collect", function() {
  beforeEach(() => {
    mockFs({
      src: {
        components: {
          "Ignore.js": "Messages are collected only from JS files.",
          "Broken.json": "Invalid JSONs are ignored too.",
          "Babel.json": JSON.stringify({
            "Babel Documentation": {
              message: "Babel Documentation",
              origin: [["src/components/Babel.js", 5]]
            },
            Label: {
              message: "Label",
              origin: [["src/components/Babel.js", 7]]
            }
          }),
          "Typescript.json": JSON.stringify({
            "Typescript Documentation": {
              message: "Typescript Documentation",
              origin: [["src/components/Typescript.ts", 5]]
            },
            Label: {
              message: "Label",
              origin: [["src/components/Typescript.ts", 7]]
            }
          })
        }
      },

      // test case for an error with different defaults
      diffDefaults: {
        "First.js.json": JSON.stringify({
          "msg.id": {
            message: "First default",
            origin: [["diffDefaults/First.js", 2]]
          }
        }),
        "Second.js.json": JSON.stringify({
          "msg.id": {
            message: "Second default",
            origin: [["diffDefaults/Second.js", 5]]
          }
        })
      },

      // test case for when only one defaults message is specified
      onlyOneDefault: {
        "First.js.json": JSON.stringify({
          "msg.id": {
            origin: [["onlyOneDefault/First.js", 2]]
          }
        }),
        "Second.js.json": JSON.stringify({
          "msg.id": {
            message: "Second default",
            origin: [["onlyOneDefault/Second.js", 5]]
          }
        })
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("should traverse directory and collect messages", function() {
    const { collect } = require("./extract")
    const catalog = collect("src")
    mockFs.restore()
    expect(catalog).toMatchSnapshot()
  })

  it("should throw an error about different defaults", function() {
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

  it("should use defined default", function() {
    const { collect } = require("./extract")
    const catalog = collect("onlyOneDefault")
    mockFs.restore()
    expect(catalog).toMatchSnapshot()
  })
})

describe("cleanObsolete", function() {
  it("should remove obsolete messages from catalogs", function() {
    const { cleanObsolete } = require("./extract")

    const catalogs = {
      en: {
        Label: {
          translation: "Label"
        },
        PreviousLabel: {
          obsolete: true
        }
      },
      fr: {
        Label: {
          translation: "Label"
        },
        Obsolete: {
          translation: "Obsolete",
          obsolete: true
        }
      }
    }

    expect(cleanObsolete(catalogs)).toMatchSnapshot()
  })
})

describe("order", function() {
  it("should order messages alphabetically", function() {
    const { order } = require("./extract")

    const catalogs = {
      en: {
        LabelB: {
          translation: "B"
        },
        LabelA: {
          translation: "A"
        },
        LabelD: {
          translation: "D"
        },
        LabelC: {
          translation: "C"
        }
      },
      fr: {
        LabelB: {
          translation: "B"
        },
        LabelA: {
          translation: "A"
        },
        LabelD: {
          translation: "D"
        },
        LabelC: {
          translation: "C"
        }
      }
    }

    const orderedCatalogs = order(catalogs)

    // Test that the message content is the same as before
    expect(orderedCatalogs).toMatchSnapshot()

    // Jest snapshot order the keys automatically, so test that the key order explicitly
    expect({
      en: Object.keys(orderedCatalogs.en),
      fr: Object.keys(orderedCatalogs.fr)
    }).toMatchSnapshot()
  })
})
