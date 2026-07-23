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

function compileTimeMacro(
  code: string,
  vars: Record<string, unknown> = {},
): { id: string; message?: string; values?: Record<string, unknown> } {
  const transformed = transformSync(code, {
    filename: "<test>.js",
    configFile: false,
    babelrc: false,
    plugins: [[linguiMacroPlugin, { linguiConfig }]],
  })!.code!

  const varNames = Object.keys(vars)
  const fn = new Function(...varNames, "return " + transformed)
  return fn(...varNames.map((k) => vars[k]))
}

describe("runtime macro", () => {
  describe("msg tagged template", () => {
    it("static text", () => {
      const result = msg`Message`
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "xDAtGP",
        "message": "Message",
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg\`Message\``,
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("named argument via labeled expression", () => {
      const value = "World"
      const result = msg`Hello ${{ name: value }}`
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "OVaF9k",
        "message": "Hello {name}",
        "values": {
          "name": "World",
        },
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg\`Hello \${name}\``,
        { name: value },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("multiple named arguments", () => {
      const first = "foo"
      const second = "bar"
      const result = msg`${{ first }} and ${{ second }}`
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

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg\`\${{ first }} and \${{ second }}\``,
        { first, second },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("duplicate named values are deduplicated", () => {
      const name = "Alice"
      const result = msg`${{ name }} and ${{ name }}`
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "8cTJuM",
        "message": "{name} and {name}",
        "values": {
          "name": "Alice",
        },
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg\`\${{name}} and \${{name}}\``,
        { name },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("no values when only static text", () => {
      const result = msg`Just text`
      expect(result.values).toBeUndefined()
    })
  })

  describe("msg call expression", () => {
    it("with message only", () => {
      const result = msg({ message: "Hello" })
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "uzTaYi",
        "message": "Hello",
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg({ message: "Hello" })`,
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("with custom id", () => {
      const result = msg({ id: "custom.id", message: "Hello" })
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "custom.id",
        "message": "Hello",
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg({ id: "custom.id", message: "Hello" })`,
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("with context generates different id", () => {
      const withoutCtx = msg({ message: "Hello" })
      const withCtx = msg({ message: "Hello", context: "my custom" })
      expect(withoutCtx.id).not.toBe(withCtx.id)
      expect(withCtx).toMatchInlineSnapshot(`
      {
        "context": "my custom",
        "id": "BYqAaU",
        "message": "Hello",
      }
    `)

      const compiledWithCtx = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg({ message: "Hello", context: "my custom" })`,
      )
      expect(withCtx.id).toBe(compiledWithCtx.id)
      expect(withCtx.message).toBe(compiledWithCtx.message)

      const compiledWithoutCtx = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg({ message: "Hello" })`,
      )
      expect(withoutCtx.id).toBe(compiledWithoutCtx.id)
      expect(withoutCtx.message).toBe(compiledWithoutCtx.message)
    })

    it("with comment", () => {
      const result = msg({
        id: "msgId",
        message: "Hello",
        comment: "description for translators",
      })
      expect(result).toMatchInlineSnapshot(`
      {
        "comment": "description for translators",
        "id": "msgId",
        "message": "Hello",
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg({ id: "msgId", message: "Hello", comment: "description for translators" })`,
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("expands msg tagged template in message property", () => {
      const username = "Alice"
      const result = msg({
        context: "some context",
        message: msg`Welcome back ${{ username }}`,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "context": "some context",
          "id": "9mX_7A",
          "message": "Welcome back {username}",
          "values": {
            "username": "Alice",
          },
        }
      `)

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg({ context: "some context", message: \`Welcome back \${{username}}\` })`,
        { username },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("expands plural marker in message property", () => {
      const count = 5
      const result = msg({
        id: "items.count",
        message: plural({ count }, { one: "# item", other: "# items" }),
      })
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "items.count",
        "message": "{count, plural, one {# item} other {# items}}",
        "values": {
          "count": 5,
        },
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg, plural } from '@lingui/core/macro';
         msg({ id: "items.count", message: plural({ count }, { one: "# item", other: "# items" }) })`,
        { count },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("expands msg with nested plural in message property", () => {
      const count = 3
      const result = msg({
        id: "shelf.items",
        comment: "shelf item count",
        message: msg`There are ${plural({ count }, { one: "# item", other: "# items" })} on the shelf`,
      })
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

      const compiled = compileTimeMacro(
        `import { msg, plural } from '@lingui/core/macro';
         msg({ id: "shelf.items", comment: "shelf item count", message: \`There are \${plural(count, { one: "# item", other: "# items" })} on the shelf\` })`,
        { count },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("plain string message still works", () => {
      const result = msg({ id: "simple", message: "Hello World" })
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "simple",
        "message": "Hello World",
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg } from '@lingui/core/macro';
         msg({ id: "simple", message: "Hello World" })`,
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })
  })

  describe("plural", () => {
    it("standalone with labeled name", () => {
      const result = plural({ count: 5 }, { one: "# book", other: "# books" })
      expect(result).toMatchInlineSnapshot(`
      {
        "format": "plural",
        "formattedOptions": "one {# book} other {# books}",
        "id": "esnaQO",
        "labeledName": "count",
        "message": "{count, plural, one {# book} other {# books}}",
        "nestedValues": {},
        "value": 5,
        "values": {
          "count": 5,
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)

      const compiled = compileTimeMacro(
        `import { plural, msg } from '@lingui/core/macro';
         msg\`\${plural(count, { one: "# book", other: "# books" })}\``,
        { count: 5 },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("with offset", () => {
      const result = plural(
        { count: 5 },
        { offset: 1, one: "# book", other: "# books" },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "format": "plural",
        "formattedOptions": "offset:1 one {# book} other {# books}",
        "id": "k4CBSl",
        "labeledName": "count",
        "message": "{count, plural, offset:1 one {# book} other {# books}}",
        "nestedValues": {},
        "value": 5,
        "values": {
          "count": 5,
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)

      const compiled = compileTimeMacro(
        `import { plural, msg } from '@lingui/core/macro';
         msg\`\${plural(count, { offset: 1, one: "# book", other: "# books" })}\``,
        { count: 5 },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("with exact numeric matches", () => {
      const result = plural(
        { count: 5 },
        { 0: "No books", 1: "One book", other: "# books" },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "format": "plural",
        "formattedOptions": "=0 {No books} =1 {One book} other {# books}",
        "id": "GPfHcr",
        "labeledName": "count",
        "message": "{count, plural, =0 {No books} =1 {One book} other {# books}}",
        "nestedValues": {},
        "value": 5,
        "values": {
          "count": 5,
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)

      const compiled = compileTimeMacro(
        `import { plural, msg } from '@lingui/core/macro';
         msg\`\${plural(count, { 0: "No books", 1: "One book", other: "# books" })}\``,
        { count: 5 },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("nested in msg with labeled name", () => {
      const count = 5
      const result = msg`There are ${plural({ count }, { one: "# item", other: "# items" })}`
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "M3GBhI",
        "message": "There are {count, plural, one {# item} other {# items}}",
        "values": {
          "count": 5,
        },
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg, plural } from '@lingui/core/macro';
         msg\`There are \${plural(count, { one: "# item", other: "# items" })}\``,
        { count },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("nested in msg alongside other expressions", () => {
      const name = "shelf"
      const count = 3
      const result = msg`${{ name }} has ${plural({ count }, { one: "# item", other: "# items" })}`
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

      const compiled = compileTimeMacro(
        `import { msg, plural } from '@lingui/core/macro';
         msg\`\${name} has \${plural(count, { one: "# item", other: "# items" })}\``,
        { name, count },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })
  })

  describe("select", () => {
    it("standalone with labeled name", () => {
      const result = select(
        { gender: "male" },
        { male: "he", female: "she", other: "they" },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "format": "select",
        "formattedOptions": "male {he} female {she} other {they}",
        "id": "VRptzI",
        "labeledName": "gender",
        "message": "{gender, select, male {he} female {she} other {they}}",
        "nestedValues": {},
        "value": "male",
        "values": {
          "gender": "male",
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)

      const compiled = compileTimeMacro(
        `import { select, msg } from '@lingui/core/macro';
         msg\`\${select(gender, { male: "he", female: "she", other: "they" })}\``,
        { gender: "male" },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("nested in msg", () => {
      const gender = "female"
      const result = msg`User is ${select({ gender }, { male: "he", female: "she", other: "they" })}`
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "BZT5Wi",
        "message": "User is {gender, select, male {he} female {she} other {they}}",
        "values": {
          "gender": "female",
        },
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg, select } from '@lingui/core/macro';
         msg\`User is \${select(gender, { male: "he", female: "she", other: "they" })}\``,
        { gender },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })
  })

  describe("selectOrdinal", () => {
    it("standalone with labeled name", () => {
      const result = selectOrdinal(
        { count: 3 },
        { one: "#st", two: "#nd", few: "#rd", other: "#th" },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "format": "selectordinal",
        "formattedOptions": "one {#st} two {#nd} few {#rd} other {#th}",
        "id": "Q9Q8Bj",
        "labeledName": "count",
        "message": "{count, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}",
        "nestedValues": {},
        "value": 3,
        "values": {
          "count": 3,
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)

      const compiled = compileTimeMacro(
        `import { selectOrdinal, msg } from '@lingui/core/macro';
         msg\`\${selectOrdinal(count, { one: "#st", two: "#nd", few: "#rd", other: "#th" })}\``,
        { count: 3 },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("nested in msg", () => {
      const count = 3
      const result = msg`This is my ${selectOrdinal({ count }, { one: "#st", two: "#nd", other: "#th" })} cat`
      expect(result).toMatchInlineSnapshot(`
      {
        "id": "4DU88f",
        "message": "This is my {count, selectordinal, one {#st} two {#nd} other {#th}} cat",
        "values": {
          "count": 3,
        },
      }
    `)

      const compiled = compileTimeMacro(
        `import { msg, selectOrdinal } from '@lingui/core/macro';
         msg\`This is my \${selectOrdinal(count, { one: "#st", two: "#nd", other: "#th" })} cat\``,
        { count },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })
  })

  describe("nesting and composition", () => {
    it("select containing plural", () => {
      const gender = "male"
      const numOfGuests = 3
      const result = select(
        { gender },
        {
          male: plural(
            { numOfGuests },
            {
              one: "He invites one guest",
              other: "He invites # guests",
            },
          ),
          female: "She is {gender}",
          other: "They are {gender}",
        },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "format": "select",
        "formattedOptions": "male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They are {gender}}",
        "id": "kqJ8fi",
        "labeledName": "gender",
        "message": "{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They are {gender}}}",
        "nestedValues": {
          "numOfGuests": 3,
        },
        "value": "male",
        "values": {
          "gender": "male",
          "numOfGuests": 3,
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)

      const compiled = compileTimeMacro(
        `import { select, plural, msg } from '@lingui/core/macro';
         msg\`\${select(gender, {
           male: plural(numOfGuests, { one: "He invites one guest", other: "He invites # guests" }),
           female: "She is {gender}",
           other: "They are {gender}",
         })}\``,
        { gender, numOfGuests },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("msg with multiple nested macros", () => {
      const count = 5
      const gender = "female"
      const result = msg`${plural({ count }, { one: "# item", other: "# items" })} for ${select({ gender }, { male: "him", female: "her", other: "them" })}`
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

      const compiled = compileTimeMacro(
        `import { msg, plural, select } from '@lingui/core/macro';
         msg\`\${plural(count, { one: "# item", other: "# items" })} for \${select(gender, { male: "him", female: "her", other: "them" })}\``,
        { count, gender },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("msg tagged template as plural option value", () => {
      const count = 5
      const name = "Alice"
      const result = plural(
        { count },
        {
          one: msg`# item for ${{ name }}`,
          other: msg`# items for ${{ name }}`,
        },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "format": "plural",
        "formattedOptions": "one {# item for {name}} other {# items for {name}}",
        "id": "vW9lXK",
        "labeledName": "count",
        "message": "{count, plural, one {# item for {name}} other {# items for {name}}}",
        "nestedValues": {
          "name": "Alice",
        },
        "value": 5,
        "values": {
          "count": 5,
          "name": "Alice",
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)

      const compiled = compileTimeMacro(
        `import { plural, msg } from '@lingui/core/macro';
         msg\`\${plural(count, { one: \`# item for \${name}\`, other: \`# items for \${name}\` })}\``,
        { count, name },
      )
      expect(result.id).toBe(compiled.id)
      expect(result.message).toBe(compiled.message)
    })

    it("msg tagged template as select option value", () => {
      const gender = "male"
      const name = "Alex"
      const result = select(
        { gender },
        {
          male: msg`He is ${{ name }}`,
          female: msg`She is ${{ name }}`,
          other: msg`They are ${{ name }}`,
        },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "format": "select",
        "formattedOptions": "male {He is {name}} female {She is {name}} other {They are {name}}",
        "id": "Zk1d1X",
        "labeledName": "gender",
        "message": "{gender, select, male {He is {name}} female {She is {name}} other {They are {name}}}",
        "nestedValues": {
          "name": "Alex",
        },
        "value": "male",
        "values": {
          "gender": "male",
          "name": "Alex",
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)

      const compiled = compileTimeMacro(
        `import { select, msg } from '@lingui/core/macro';
         msg\`\${select(gender, {
           male: \`He is \${name}\`,
           female: \`She is \${name}\`,
           other: \`They are \${name}\`,
         })}\``,
        { gender, name },
      )
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
