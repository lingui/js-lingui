import generate from "@babel/generator"
import { compile, createCompiledCatalog } from "./compile"

describe("compile", () => {
  const getSource = (message: string) =>
    generate(compile(message) as any, {
      compact: true,
      minified: true,
      jsescOption: { minimal: true },
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

  it("should compile multiple plurals", () => {
    expect(
      getSource(
        "{bcount, plural, one {boy} other {# boys}} {gcount, plural, one {girl} other {# girls}}"
      )
    ).toEqual(
      '[["bcount","plural",{one:"boy",other:["#"," boys"]}]," ",["gcount","plural",{one:"girl",other:["#"," girls"]}]]'
    )
  })

  it("should report failed message on error", () => {
    expect(() =>
      getSource("{value, plural, one {Book} other {Books")
    ).toThrowErrorMatchingSnapshot()
  })

  describe("with pseudo-localization", () => {
    const getPSource = (message: string) =>
      generate(compile(message, true) as any, {
        compact: true,
        minified: true,
        jsescOption: { minimal: true },
      }).code

    it("should pseudolocalize strings", () => {
      expect(getPSource("Martin Černý")).toEqual('"Màŕţĩń Čēŕńý"')
    })

    it("should pseudolocalize escaping syntax characters", () => {
      // TODO: should this turn into pseudoLocale string?
      expect(getPSource("'{name}'")).toEqual('"{name}"')
      // expect(getPSource("'{name}'")).toEqual('"{ńàmē}"')
    })

    it("should not pseudolocalize arguments", () => {
      expect(getPSource("{name}")).toEqual('[["name"]]')
      expect(getPSource("B4 {name} A4")).toEqual('["ß4 ",["name"]," À4"]')
    })

    it("should not pseudolocalize arguments nor formats", () => {
      expect(getPSource("{name, number}")).toEqual('[["name","number"]]')
      expect(getPSource("{name, number, percent}")).toEqual(
        '[["name","number","percent"]]'
      )
    })

    it("should not pseudolocalize HTML tags", () => {
      expect(getPSource('Martin <span id="spanId">Černý</span>')).toEqual(
        JSON.stringify('Màŕţĩń <span id="spanId">Čēŕńý</span>')
      )
      expect(
        getPSource("Martin Cerny  123a<span id='id'>Černý</span>")
      ).toEqual(
        JSON.stringify("Màŕţĩń Ćēŕńŷ  123à<span id='id'>Čēŕńý</span>")
      )
      expect(getPSource("Martin <a title='>>a'>a</a>")).toEqual(
        JSON.stringify("Màŕţĩń <a title='>>a'>à</a>")
      )
      expect(getPSource("<a title=TITLE>text</a>")).toEqual(
        JSON.stringify("<a title=TITLE>ţēxţ</a>")
      )
    })

    describe("Plurals", () => {
      it("with value", () => {
        expect(
          getPSource("{value, plural, one {# book} other {# books}}")
        ).toEqual('[["value","plural",{one:["#"," ƀōōķ"],other:["#"," ƀōōķś"]}]]')
      })

      it("with variable placeholder", () => {
        expect(
          getPSource(
            "{count, plural, one {{countString} book} other {{countString} books}}"
          )
        ).toEqual(
          '[["count","plural",{one:[["countString"]," ƀōōķ"],other:[["countString"]," ƀōōķś"]}]]'
        )
      })

      it("with offset", () => {
        expect(
          getPSource(
            "{count, plural, offset:1 zero {There are no messages} other {There are # messages in your inbox}}"
          )
        ).toEqual(
          '[["count","plural",{offset:1,zero:"Ţĥēŕē àŕē ńō mēśśàĝēś",other:["Ţĥēŕē àŕē ","#"," mēśśàĝēś ĩń ŷōũŕ ĩńƀōx"]}]]'
        )
      })

      it("with HTML tags", () => {
        expect(
          getPSource(
            "{count, plural, zero {There's # <span>message</span>} other {There are # messages}}"
          )
        ).toEqual(
          '[["count","plural",{zero:["Ţĥēŕē\'ś ","#"," <span>mēśśàĝē</span>"],other:["Ţĥēŕē àŕē ","#"," mēśśàĝēś"]}]]'
        )
      })

      it("with exact number", () => {
        expect(
          getPSource(
            "{count, plural, =0 {There's # <span>message</span>} other {There are # messages}}"
          )
        ).toEqual(
          '[["count","plural",{0:["Ţĥēŕē\'ś ","#"," <span>mēśśàĝē</span>"],other:["Ţĥēŕē àŕē ","#"," mēśśàĝēś"]}]]'
        )
      })
    })

    it("SelectOrdinal", () => {
      expect(
        getPSource(
          "{count, selectordinal, offset:1 one {#st} two {#nd} few {#rd} =4 {4th} many {testMany} other {#th}}"
        )
      ).toEqual(
          '[["count","selectordinal",{offset:1,one:["#","śţ"],two:["#","ńď"],few:["#","ŕď"],4:"4ţĥ",many:"ţēśţMàńŷ",other:["#","ţĥ"]}]]'
      )
    })

    it("Select", () => {
      expect(
        getPSource(
          "{gender, select, male {He} female {She} other {<span>Other</span>}}"
        )
      ).toEqual(
        '[["gender","select",{male:"Ĥē",female:"Śĥē",other:"<span>Ōţĥēŕ</span>"}]]'
      )
    })

    it("should not pseudolocalize variables", () => {
      expect(getPSource("replace {count}")).toEqual('["ŕēƥĺàćē ",["count"]]')
      expect(getPSource("replace { count }")).toEqual('["ŕēƥĺàćē ",["count"]]')
    })

    it("Multiple Plurals", () => {
      expect(
        getPSource(
          "{bcount, plural, one {boy} other {# boys}} {gcount, plural, one {girl} other {# girls}}"
        )
      ).toEqual(
        '[["bcount","plural",{one:"ƀōŷ",other:["#"," ƀōŷś"]}]," ",["gcount","plural",{one:"ĝĩŕĺ",other:["#"," ĝĩŕĺś"]}]]'
      )
    })
  })
})

describe("createCompiledCatalog", () => {
  it("nested message", () => {
      expect(
        createCompiledCatalog(
          "cs",
          {
            nested: {
              one: "Uno",
              two: "Dos",
              three: "Tres",
              hello: "Hola {name}",
            },
          },
          {}
        )
      ).toMatchSnapshot()
  })

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

    it("should compile with ts", () => {
      expect(getCompiledCatalog("ts")).toMatchSnapshot()
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
          Select: "{id, select, Gen {Genesis} 1John {1 John}  other {____}}",
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

  describe("options.pure", () => {
    const getCompiledCatalog = (pure) =>
      createCompiledCatalog(
        "ps",
        {
          Hello: "Ahoj",
        },
        {
          pure,
        }
      )

    it("should return pure catalog", () => {
      expect(getCompiledCatalog(true)).toMatchSnapshot()
    })

    it("should return code catalog", () => {
      expect(getCompiledCatalog(false)).toMatchSnapshot()
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
      expect(
        getCompiledCatalog({
          compilerBabelOptions: {
            jsescOption: {
              minimal: false,
            },
          },
        })
      ).toMatchSnapshot()
    })
  })
})
