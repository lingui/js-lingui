import {
  msg,
  defineMessage,
  plural,
  select,
  selectOrdinal,
} from "./runtime-macro"
import { transformSync } from "@babel/core"
import linguiMacroPlugin from "@lingui/babel-plugin-lingui-macro"
import { makeConfig } from "@lingui/conf"

const linguiConfig = makeConfig({ rootDir: __dirname, locales: ["en"] })

function wrapInMsg(code: string) {
  return code.startsWith("msg") ? code : "msg`${" + code + "}`"
}

function compileTimeMacro(
  code: string,
  vars: Record<string, unknown> = {},
): { id: string; message?: string; values?: Record<string, unknown> } {
  const input =
    "import { msg, plural, select, selectOrdinal } from '@lingui/core/macro';\n" +
    wrapInMsg(code)

  const transformed = transformSync(input, {
    filename: "<test>.js",
    configFile: false,
    babelrc: false,
    plugins: [[linguiMacroPlugin, { linguiConfig }]],
  })!.code!

  const varNames = Object.keys(vars)
  const fn = new Function(...varNames, "return " + transformed)
  return fn(...varNames.map((k) => vars[k]))
}

function runtimeMacro(
  code: string,
  vars: Record<string, unknown> = {},
): { id: string; message?: string; values?: Record<string, unknown> } {
  const allVars: Record<string, unknown> = {
    msg,
    plural,
    select,
    selectOrdinal,
    ...vars,
  }
  const varNames = Object.keys(allVars)
  const fn = new Function(...varNames, "return " + wrapInMsg(code))
  return fn(...varNames.map((k) => allVars[k]))
}

describe("runtime macro", () => {
  describe("msg tagged template", () => {
    it("static text", () => {
      const code = "msg`Message`"
      const result = runtimeMacro(code)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "xDAtGP",
        "message": "Message",
      }
    `)

      expect(result).toStrictEqual(compileTimeMacro(code))
    })

    it("named argument via labeled expression", () => {
      const vars = { name: "World" }
      const code = "msg`Hello ${{ name }}`"
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "OVaF9k",
        "message": "Hello {name}",
        "values": {
          "name": "World",
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("multiple named arguments", () => {
      const vars = { first: "foo", second: "bar" }
      const code = "msg`${{ first }} and ${{ second }}`"
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
        {
          "id": "6-yL__",
          "message": "{first} and {second}",
          "values": {
            "first": "foo",
            "second": "bar",
          },
        }
      `)
      expect(result).toStrictEqual(compileTimeMacro(code, vars))
    })

    it("duplicate named values are deduplicated", () => {
      const vars = { name: "Alice" }
      const code = "msg`${{ name }} and ${{ name }}`"
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "8cTJuM",
        "message": "{name} and {name}",
        "values": {
          "name": "Alice",
        },
      }
    `)

      expect(result).toStrictEqual(compileTimeMacro(code, vars))
    })

    it("no values when only static text", () => {
      const code = "msg`Just text`"
      const result = runtimeMacro(code)
      expect(result.values).toBeUndefined()
      expect(result).toStrictEqual(compileTimeMacro(code))
    })
  })

  describe("msg call expression", () => {
    it("with message only", () => {
      const code = 'msg({ message: "Hello" })'
      const result = runtimeMacro(code)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "uzTaYi",
        "message": "Hello",
      }
    `)

      expect(result).toStrictEqual(compileTimeMacro(code))
    })

    it("with custom id", () => {
      const code = 'msg({ id: "custom.id", message: "Hello" })'
      const result = runtimeMacro(code)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "custom.id",
        "message": "Hello",
      }
    `)

      expect(result).toStrictEqual(compileTimeMacro(code))
    })

    it("with context generates different id", () => {
      const codeWithCtx = 'msg({ message: "Hello", context: "my custom" })'
      const codeWithoutCtx = 'msg({ message: "Hello" })'

      const withCtx = runtimeMacro(codeWithCtx)
      const withoutCtx = runtimeMacro(codeWithoutCtx)
      expect(withoutCtx.id).not.toBe(withCtx.id)
      expect(withCtx).toMatchInlineSnapshot(`
      {
        "context": "my custom",
        "id": "BYqAaU",
        "message": "Hello",
      }
    `)

      const compiledWithCtx = compileTimeMacro(codeWithCtx)
      expect(withCtx.id).toBe(compiledWithCtx.id)
      expect(withCtx.message).toBe(compiledWithCtx.message)

      const compiledWithoutCtx = compileTimeMacro(codeWithoutCtx)
      expect(withoutCtx.id).toBe(compiledWithoutCtx.id)
      expect(withoutCtx.message).toBe(compiledWithoutCtx.message)
    })

    it("with comment", () => {
      const code = `msg({
        id: "msgId",
        message: "Hello",
        comment: "description for translators"
      })`
      const result = runtimeMacro(code)
      expect(result).toMatchInlineSnapshot(`
      {
        "comment": "description for translators",
        "id": "msgId",
        "message": "Hello",
      }
    `)

      expect(result).toStrictEqual(compileTimeMacro(code))
    })

    it("expands plural in message property", () => {
      const vars = { count: 5 }
      const code = `msg({
        id: "items.count",
        message: msg\`\${plural({ count }, { one: "# item", other: "# items" })}\`
      })`
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "items.count",
        "message": "{count, plural, one {# item} other {# items}}",
        "values": {
          "count": 5,
        },
      }
    `)

      expect(result).toStrictEqual(compileTimeMacro(code, vars))
    })

    it("expands msg with nested plural in message property", () => {
      const vars = { count: 3 }
      const code = `msg({
        id: "shelf.items",
        comment: "shelf item count",
        message: msg\`There are \${plural({ count }, { one: "# item", other: "# items" })} on the shelf\`
      })`
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "comment": "shelf item count",
        "id": "shelf.items",
        "message": "There are {count, plural, one {# item} other {# items}} on the shelf",
        "values": {
          "count": 3,
        },
      }
    `)

      expect(result).toStrictEqual(compileTimeMacro(code, vars))
    })

    it("plain string message still works", () => {
      const code = 'msg({ id: "simple", message: "Hello World" })'
      const result = runtimeMacro(code)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "simple",
        "message": "Hello World",
      }
    `)

      expect(result).toStrictEqual(compileTimeMacro(code))
    })
  })

  describe("plural", () => {
    it("standalone with labeled name", () => {
      const vars = { count: 5 }
      const code = 'plural({ count }, { one: "# book", other: "# books" })'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "esnaQO",
        "message": "{count, plural, one {# book} other {# books}}",
        "values": {
          "count": 5,
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("with offset", () => {
      const vars = { count: 5 }
      const code =
        'plural({ count }, { offset: 1, one: "# book", other: "# books" })'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "k4CBSl",
        "message": "{count, plural, offset:1 one {# book} other {# books}}",
        "values": {
          "count": 5,
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("with exact numeric matches", () => {
      const vars = { count: 5 }
      const code =
        'plural({ count }, { 0: "No books", 1: "One book", other: "# books" })'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "GPfHcr",
        "message": "{count, plural, =0 {No books} =1 {One book} other {# books}}",
        "values": {
          "count": 5,
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("nested in msg with surrounding text", () => {
      const vars = { count: 5 }
      const code =
        'msg`There are ${plural({ count }, { one: "# item", other: "# items" })}`'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "M3GBhI",
        "message": "There are {count, plural, one {# item} other {# items}}",
        "values": {
          "count": 5,
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("nested in msg alongside other expressions", () => {
      const vars = { name: "shelf", count: 3 }
      const code =
        'msg`${{ name }} has ${plural({ count }, { one: "# item", other: "# items" })}`'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "TvDp_S",
        "message": "{name} has {count, plural, one {# item} other {# items}}",
        "values": {
          "count": 3,
          "name": "shelf",
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })
  })

  describe("select", () => {
    it("standalone with labeled name", () => {
      const vars = { gender: "male" }
      const code =
        'select({ gender }, { male: "he", female: "she", other: "they" })'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "VRptzI",
        "message": "{gender, select, male {he} female {she} other {they}}",
        "values": {
          "gender": "male",
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("nested in msg", () => {
      const vars = { gender: "female" }
      const code =
        'msg`User is ${select({ gender }, { male: "he", female: "she", other: "they" })}`'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "BZT5Wi",
        "message": "User is {gender, select, male {he} female {she} other {they}}",
        "values": {
          "gender": "female",
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })
  })

  describe("selectOrdinal", () => {
    it("standalone with labeled name", () => {
      const vars = { count: 3 }
      const code =
        'selectOrdinal({ count }, { one: "#st", two: "#nd", few: "#rd", other: "#th" })'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "Q9Q8Bj",
        "message": "{count, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}",
        "values": {
          "count": 3,
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("nested in msg", () => {
      const vars = { count: 3 }
      const code =
        'msg`This is my ${selectOrdinal({ count }, { one: "#st", two: "#nd", other: "#th" })} cat`'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "4DU88f",
        "message": "This is my {count, selectordinal, one {#st} two {#nd} other {#th}} cat",
        "values": {
          "count": 3,
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })
  })

  describe("nesting and composition", () => {
    it("select containing plural", () => {
      const vars = { gender: "male", numOfGuests: 3 }
      const code = `select({ gender }, {
        male: plural({ numOfGuests }, { one: "He invites one guest", other: "He invites # guests" }),
        female: "She is {gender}",
        other: "They are {gender}"
      })`
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "kqJ8fi",
        "message": "{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They are {gender}}}",
        "values": {
          "gender": "male",
          "numOfGuests": 3,
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("msg with multiple nested macros", () => {
      const vars = { count: 5, gender: "female" }
      const code =
        'msg`${plural({ count }, { one: "# item", other: "# items" })} for ${select({ gender }, { male: "him", female: "her", other: "them" })}`'
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "gn87Kc",
        "message": "{count, plural, one {# item} other {# items}} for {gender, select, male {him} female {her} other {them}}",
        "values": {
          "count": 5,
          "gender": "female",
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("msg tagged template as plural option value", () => {
      const vars = { count: 5, name: "Alice" }

      const code = `plural(
        { count },
        {
          one: msg\`# item for \${{ name }}\`,
          other: msg\`# items for \${{ name }}\`,
        },
      )`

      const result = runtimeMacro(code, vars)

      expect(result).toMatchInlineSnapshot(`
      {
        "id": "vW9lXK",
        "message": "{count, plural, one {# item for {name}} other {# items for {name}}}",
        "values": {
          "count": 5,
          "name": "Alice",
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.message).toBe(compiled.message)
      expect(result.id).toBe(compiled.id)
    })

    it("msg tagged template as select option value", () => {
      const vars = { gender: "male", name: "Alex" }
      const code = `select({ gender }, {
        male: msg\`He is \${{ name }}\`,
        female: msg\`She is \${{ name }}\`,
        other: msg\`They are \${{ name }}\`
      })`
      const result = runtimeMacro(code, vars)
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "Zk1d1X",
        "message": "{gender, select, male {He is {name}} female {She is {name}} other {They are {name}}}",
        "values": {
          "gender": "male",
          "name": "Alex",
        },
      }
    `)

      const compiled = compileTimeMacro(code, vars)
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })
  })

  describe("error handling", () => {
    it("throws on raw string value", () => {
      expect(() => msg`Hello ${"world"}`).toThrowErrorMatchingInlineSnapshot(
        `[Error: msg: A raw value (string) was passed at position 0. Passing values directly is not supported because variable names cannot be inferred at runtime. Use a labeled placeholder syntax: \${{ label: value }}.]`,
      )
    })

    it("throws on raw number value", () => {
      expect(() => msg`Count: ${42}`).toThrowErrorMatchingInlineSnapshot(
        `[Error: msg: A raw value (number) was passed at position 0. Passing values directly is not supported because variable names cannot be inferred at runtime. Use a labeled placeholder syntax: \${{ label: value }}.]`,
      )
    })

    it("throws on undefined", () => {
      expect(() => msg`Hello ${undefined}`).toThrowErrorMatchingInlineSnapshot(
        `[Error: msg: A raw value (undefined) was passed at position 0. Passing values directly is not supported because variable names cannot be inferred at runtime. Use a labeled placeholder syntax: \${{ label: value }}.]`,
      )
    })

    it("throws on function", () => {
      expect(
        () => msg`Hello ${() => "world"}`,
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: msg: A function was passed at position 0. Did you forget to call it? Use a labeled placeholder syntax: \${{ label: myFn() }}.]`,
      )
    })

    it("throws on empty object", () => {
      expect(() => msg`Hello ${{}}`).toThrowErrorMatchingInlineSnapshot(
        `[Error: msg: Unexpected empty object at position 0. Use a labeled placeholder syntax: \${{ label: value }}.]`,
      )
    })

    it("throws on object with multiple keys", () => {
      expect(
        () => msg`Hello ${{ first: "a", second: "b" }}`,
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: msg: Object with multiple keys (first, second) at position 0. You probably put a value directly into the message. This is not supported. Use a labeled placeholder syntax: \${{ label: value }}.]`,
      )
    })

    it("reports correct position for errors", () => {
      const name = "Alice"
      expect(
        () => msg`${{ name }} has ${undefined} items`,
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: msg: A raw value (undefined) was passed at position 1. Passing values directly is not supported because variable names cannot be inferred at runtime. Use a labeled placeholder syntax: \${{ label: value }}.]`,
      )
    })

    it("plural throws on raw value", () => {
      expect(() => {
        plural(5, { one: "# book", other: "# books" })
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: plural(): A raw value (number) was passed as first argument. Passing values directly is not supported because variable names cannot be inferred at runtime. Use a labeled placeholder syntax: plural({ label: value }, { ... }).]`,
      )
    })

    it("plural throws on undefined", () => {
      expect(() => {
        plural(undefined, { one: "# book", other: "# books" })
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: plural(): First argument is undefined. Use a labeled placeholder syntax: plural({ label: value }, { ... }).]`,
      )
    })

    it("plural throws on empty object", () => {
      expect(() => {
        plural({}, { one: "# book", other: "# books" })
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: plural(): Unexpected empty object as first argument. Use a labeled placeholder syntax: plural({ label: value }, { ... }).]`,
      )
    })

    it("plural throws on multi-property object", () => {
      expect(() => {
        plural({ a: 1, b: 2 }, { one: "# book", other: "# books" })
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: plural(): Object with multiple keys (a, b) as first argument. You probably put a value directly. This is not supported. Use a labeled placeholder syntax: plural({ label: value }, { ... }).]`,
      )
    })

    it("select throws on multi-property object", () => {
      expect(() => {
        select({ a: "x", b: "y" }, { male: "he", other: "they" })
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: select(): Object with multiple keys (a, b) as first argument. You probably put a value directly. This is not supported. Use a labeled placeholder syntax: select({ label: value }, { ... }).]`,
      )
    })

    it("select throws on raw string value", () => {
      expect(() => {
        select("male", { male: "he", other: "they" })
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: select(): A raw value (string) was passed as first argument. Passing values directly is not supported because variable names cannot be inferred at runtime. Use a labeled placeholder syntax: select({ label: value }, { ... }).]`,
      )
    })
  })

  describe("defineMessage alias", () => {
    it("is the same function as msg", () => {
      expect(defineMessage).toBe(msg)
    })

    it("works as tagged template", () => {
      expect(defineMessage`Hello`).toMatchInlineSnapshot(`
      {
        "id": "uzTaYi",
        "message": "Hello",
      }
    `)
    })
  })
})
