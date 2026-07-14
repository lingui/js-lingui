import {
  msg,
  defineMessage,
  plural,
  select,
  selectOrdinal,
} from "./runtime-macro"

describe("runtime macro", () => {
  describe("msg tagged template", () => {
    it("static text", () => {
      expect(msg`Message`).toMatchInlineSnapshot(`
      {
        "id": "xDAtGP",
        "message": "Message",
      }
    `)
    })

    it("named argument via labeled expression", () => {
      const value = "World"
      expect(msg`Hello ${{ name: value }}`).toMatchInlineSnapshot(`
      {
        "id": "OVaF9k",
        "message": "Hello {name}",
        "values": {
          "name": "World",
        },
      }
    `)
    })

    it("multiple named arguments", () => {
      const first = "foo"
      const second = "bar"
      expect(msg`${{ first }} and ${{ second }}`).toMatchInlineSnapshot(`
        {
          "id": "6-yL__",
          "message": "{first} and {second}",
          "values": {
            "first": "foo",
            "second": "bar",
          },
        }
      `)
    })

    it("duplicate named values are deduplicated", () => {
      const name = "Alice"
      expect(msg`${{ name }} and ${{ name }}`).toMatchInlineSnapshot(`
      {
        "id": "8cTJuM",
        "message": "{name} and {name}",
        "values": {
          "name": "Alice",
        },
      }
    `)
    })

    it("no values when only static text", () => {
      const result = msg`Just text`
      expect(result.values).toBeUndefined()
    })
  })

  describe("msg call expression", () => {
    it("with message only", () => {
      expect(msg({ message: "Hello" })).toMatchInlineSnapshot(`
      {
        "id": "uzTaYi",
        "message": "Hello",
      }
    `)
    })

    it("with custom id", () => {
      expect(msg({ id: "custom.id", message: "Hello" })).toMatchInlineSnapshot(`
      {
        "id": "custom.id",
        "message": "Hello",
      }
    `)
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
    })

    it("with comment", () => {
      expect(
        msg({
          id: "msgId",
          message: "Hello",
          comment: "description for translators",
        }),
      ).toMatchInlineSnapshot(`
      {
        "comment": "description for translators",
        "id": "msgId",
        "message": "Hello",
      }
    `)
    })

    it("expands msg tagged template in message property", () => {
      const username = "Alice"
      expect(
        msg({
          context: "some context",
          message: msg`Welcome back ${{ username }}`,
        }),
      ).toMatchInlineSnapshot(`
        {
          "context": "some context",
          "id": "9mX_7A",
          "message": "Welcome back {username}",
          "values": {
            "username": "Alice",
          },
        }
      `)
    })

    it("expands plural marker in message property", () => {
      const count = 5
      expect(
        msg({
          id: "items.count",
          message: plural({ count }, { one: "# item", other: "# items" }),
        }),
      ).toMatchInlineSnapshot(`
      {
        "id": "items.count",
        "message": "{count, plural, one {# item} other {# items}}",
        "values": {
          "count": 5,
        },
      }
    `)
    })

    it("expands msg with nested plural in message property", () => {
      const count = 3
      expect(
        msg({
          id: "shelf.items",
          comment: "shelf item count",
          message: msg`There are ${plural({ count }, { one: "# item", other: "# items" })} on the shelf`,
        }),
      ).toMatchInlineSnapshot(`
      {
        "comment": "shelf item count",
        "id": "shelf.items",
        "message": "There are {count, plural, one {# item} other {# items}} on the shelf",
        "values": {
          "count": 3,
        },
      }
    `)
    })

    it("plain string message still works", () => {
      expect(msg({ id: "simple", message: "Hello World" }))
        .toMatchInlineSnapshot(`
      {
        "id": "simple",
        "message": "Hello World",
      }
    `)
    })
  })

  describe("plural", () => {
    it("standalone with labeled name", () => {
      expect(plural({ count: 5 }, { one: "# book", other: "# books" }))
        .toMatchInlineSnapshot(`
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
    })

    it("with offset", () => {
      expect(
        plural({ count: 5 }, { offset: 1, one: "# book", other: "# books" }),
      ).toMatchInlineSnapshot(`
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
    })

    it("with exact numeric matches", () => {
      expect(
        plural(
          { count: 5 },
          { 0: "No books", 1: "One book", other: "# books" },
        ),
      ).toMatchInlineSnapshot(`
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
    })

    it("nested in msg with labeled name", () => {
      const count = 5
      expect(
        msg`There are ${plural({ count }, { one: "# item", other: "# items" })}`,
      ).toMatchInlineSnapshot(`
      {
        "id": "M3GBhI",
        "message": "There are {count, plural, one {# item} other {# items}}",
        "values": {
          "count": 5,
        },
      }
    `)
    })

    it("nested in msg alongside other expressions", () => {
      const name = "shelf"
      const count = 3
      expect(
        msg`${{ name }} has ${plural({ count }, { one: "# item", other: "# items" })}`,
      ).toMatchInlineSnapshot(`
      {
        "id": "TvDp_S",
        "message": "{name} has {count, plural, one {# item} other {# items}}",
        "values": {
          "count": 3,
          "name": "shelf",
        },
      }
    `)
    })
  })

  describe("select", () => {
    it("standalone with labeled name", () => {
      expect(
        select(
          { gender: "male" },
          { male: "he", female: "she", other: "they" },
        ),
      ).toMatchInlineSnapshot(`
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
    })

    it("nested in msg", () => {
      const gender = "female"
      expect(
        msg`User is ${select({ gender }, { male: "he", female: "she", other: "they" })}`,
      ).toMatchInlineSnapshot(`
      {
        "id": "BZT5Wi",
        "message": "User is {gender, select, male {he} female {she} other {they}}",
        "values": {
          "gender": "female",
        },
      }
    `)
    })
  })

  describe("selectOrdinal", () => {
    it("standalone with labeled name", () => {
      expect(
        selectOrdinal(
          { count: 3 },
          { one: "#st", two: "#nd", few: "#rd", other: "#th" },
        ),
      ).toMatchInlineSnapshot(`
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
    })

    it("nested in msg", () => {
      const count = 3
      expect(
        msg`This is my ${selectOrdinal({ count }, { one: "#st", two: "#nd", other: "#th" })} cat`,
      ).toMatchInlineSnapshot(`
      {
        "id": "4DU88f",
        "message": "This is my {count, selectordinal, one {#st} two {#nd} other {#th}} cat",
        "values": {
          "count": 3,
        },
      }
    `)
    })
  })

  describe("nesting and composition", () => {
    it("select containing plural", () => {
      const gender = "male"
      const numOfGuests = 3
      expect(
        select(
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
        ),
      ).toMatchInlineSnapshot(`
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
    })

    it("msg with multiple nested macros", () => {
      const count = 5
      const gender = "female"
      expect(
        msg`${plural({ count }, { one: "# item", other: "# items" })} for ${select({ gender }, { male: "him", female: "her", other: "them" })}`,
      ).toMatchInlineSnapshot(`
      {
        "id": "gn87Kc",
        "message": "{count, plural, one {# item} other {# items}} for {gender, select, male {him} female {her} other {them}}",
        "values": {
          "count": 5,
          "gender": "female",
        },
      }
    `)
    })

    it("msg tagged template as plural option value", () => {
      const count = 5
      const name = "Alice"
      expect(
        plural(
          { count },
          {
            one: msg`# item for ${{ name }}`,
            other: msg`# items for ${{ name }}`,
          },
        ),
      ).toMatchInlineSnapshot(`
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
    })

    it("msg tagged template as select option value", () => {
      const gender = "male"
      const name = "Alex"
      expect(
        select(
          { gender },
          {
            male: msg`He is ${{ name }}`,
            female: msg`She is ${{ name }}`,
            other: msg`They are ${{ name }}`,
          },
        ),
      ).toMatchInlineSnapshot(`
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
