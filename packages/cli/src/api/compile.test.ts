import generate from "@babel/generator"
import { compile, createCompiledCatalog } from "./compile"

describe("compile", () => {
  const getSource = (message) =>
    generate(compile(message) as any, {
      compact: true,
      minified: true,
    }).code

  it("should optimize string only messages", () => {
    expect(getSource("Hello World")).toEqual('"Hello World"')
  })

  it("should allow escaping syntax characters", () => {
    expect(getSource("'{name}'")).toEqual('"{name}"')
    expect(getSource("''")).toEqual('"\'"')
  })

  it("should compile arguments", () => {
    expect(getSource("{name}")).toEqual('[["name"]]')

    expect(getSource("B4 {name} A4")).toEqual('["B4 ",["name"]," A4"]')
  })

  it("should compile arguments with formats", () => {
    expect(getSource("{name, number}")).toEqual('[["name","number"]]')

    expect(getSource("{name, number, percent}")).toEqual(
      '[["name","number","percent"]]'
    )
  })

  it("should compile plural", () => {
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

  it("should compile select", () => {
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

  it("should report failed message on error", () => {
    expect(() =>
      getSource("{value, plural, one {Book} other {Books")
    ).toThrowErrorMatchingSnapshot()
  })
})

describe("createCompiledCatalog", () => {
  describe("options.namespace", () => {
    const getCompiledCatalog = (namespace) =>
      createCompiledCatalog(
        "fr",
        {},
        {
          namespace,
        }
      )

    it("should compile with es", () => {
      expect(getCompiledCatalog("es")).toMatchSnapshot()
    })

    it("should compile with window", () => {
      expect(getCompiledCatalog("window.test")).toMatchSnapshot()
    })

    it("should compile with global", () => {
      expect(getCompiledCatalog("global.test")).toMatchSnapshot()
    })

    it("should error with invalid value", () => {
      expect(() => getCompiledCatalog("global")).toThrowErrorMatchingSnapshot()
    })
  })

  describe("options.strict", () => {
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

    it("should return message key as a fallback translation", () => {
      expect(getCompiledCatalog(false)).toMatchSnapshot()
    })

    it("should't return message key as a fallback in strict mode", () => {
      expect(getCompiledCatalog(true)).toMatchSnapshot()
    })
  })

  describe("options.pseudoLocale", () => {
    const getCompiledCatalog = (pseudoLocale) =>
      createCompiledCatalog(
        "ps",
        {
          Hello: "Ahoj",
        },
        {
          pseudoLocale,
        }
      )

    it("should return catalog with pseudolocalized messages", () => {
      expect(getCompiledCatalog("ps")).toMatchSnapshot()
    })

    it("should return compiled catalog when pseudoLocale doesn't match current locale", () => {
      expect(getCompiledCatalog("en")).toMatchSnapshot()
    })
  })

  describe("options.compilerBabelOptions", () => {
    const getCompiledCatalog = (opts = {}) =>
      createCompiledCatalog(
        "ru",
        {
          Hello: "Alohà",
        },
        opts
      )

    it("by default should return catalog without ASCII chars", () => {
      expect(getCompiledCatalog()).toMatchSnapshot()
    })

    it("should return catalog without ASCII chars", () => {
      expect(getCompiledCatalog({
        compilerBabelOptions: { 
          jsescOption: {
            minimal: false,
          }
        }
      })).toMatchSnapshot()
    })
  })
})
