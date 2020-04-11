import generate from "@babel/generator"
import { compile, createCompiledCatalog } from "./compile"

describe("compile", function () {
  const getSource = (message) =>
    generate(compile(message) as any, {
      compact: true,
      minified: true,
    }).code

  it("should optimize string only messages", function () {
    expect(getSource("Hello World")).toEqual('"Hello World"')
  })

  it("should allow escaping syntax characters", () => {
    expect(getSource("'{name}'")).toEqual('"{name}"')
    expect(getSource("''")).toEqual('"\'"')
  })

  it("should compile arguments", function () {
    expect(getSource("{name}")).toEqual('[["name"]]')

    expect(getSource("B4 {name} A4")).toEqual('["B4 ",["name"]," A4"]')
  })

  it("should compile arguments with formats", function () {
    expect(getSource("{name, number}")).toEqual('[["name","number"]]')

    expect(getSource("{name, number, percent}")).toEqual(
      '[["name","number","percent"]]'
    )
  })

  it("should compile plural", function () {
    expect(getSource("{name, plural, one {Book} other {Books}}")).toEqual(
      '[["name","plural",{one:"Book",other:"Books"}]]'
    )

    expect(
      getSource("{name, plural, one {Book} other {{name} Books}}")
    ).toEqual('[["name","plural",{one:"Book",other:[["name"]," Books"]}]]')

    expect(getSource("{name, plural, one {Book} other {# Books}}")).toEqual(
      '[["name","plural",{one:"Book",other:["#"," Books"]}]]'
    )

    expect(
      getSource(
        "{name, plural, offset:1 =0 {No Books} one {Book} other {# Books}}"
      )
    ).toEqual(
      '[["name","plural",{offset:1,0:"No Books",one:"Book",other:["#"," Books"]}]]'
    )
  })

  it("should compile select", function () {
    expect(getSource("{name, select, male {He} female {She}}")).toEqual(
      '[["name","select",{male:"He",female:"She"}]]'
    )

    expect(getSource("{name, select, male {He} female {{name} She}}")).toEqual(
      '[["name","select",{male:"He",female:[["name"]," She"]}]]'
    )

    expect(getSource("{name, select, male {He} female {# She}}")).toEqual(
      '[["name","select",{male:"He",female:"# She"}]]'
    )
  })

  it("should report failed message on error", function () {
    expect(() =>
      getSource("{value, plural, one {Book} other {Books")
    ).toThrowErrorMatchingSnapshot()
  })
})

describe("createCompiledCatalog", function () {
  describe("options.namespace", function () {
    const getCompiledCatalog = (namespace) =>
      createCompiledCatalog(
        "fr",
        {},
        {
          namespace,
        }
      )

    it("should compile with es", function () {
      expect(getCompiledCatalog("es")).toMatchSnapshot()
    })

    it("should compile with window", function () {
      expect(getCompiledCatalog("window.test")).toMatchSnapshot()
    })

    it("should compile with global", function () {
      expect(getCompiledCatalog("global.test")).toMatchSnapshot()
    })

    it("should error with invalid value", function () {
      expect(() => getCompiledCatalog("global")).toThrowErrorMatchingSnapshot()
    })
  })

  describe("options.strict", function () {
    const getCompiledCatalog = (strict) =>
      createCompiledCatalog(
        "cs",
        {
          Hello: "Ahoj",
          Missing: "",
        },
        {
          strict,
        }
      )

    it("should return message key as a fallback translation", function () {
      expect(getCompiledCatalog(false)).toMatchSnapshot()
    })

    it("should't return message key as a fallback in strict mode", function () {
      expect(getCompiledCatalog(true)).toMatchSnapshot()
    })
  })

  describe("options.pseudoLocale", function () {
    const getCompiledCatalog = (pseudoLocale) =>
      createCompiledCatalog(
        "cs",
        {
          Hello: "Ahoj",
        },
        {
          pseudoLocale,
        }
      )

    it("should return catalog with pseudolocalized messages", function () {
      expect(getCompiledCatalog("cs")).toMatchSnapshot()
    })

    it("should return compiled catalog when pseudoLocale doesn't match current locale", function () {
      expect(getCompiledCatalog("en")).toMatchSnapshot()
    })
  })
})
