import {
  msg,
  defineMessage,
  plural,
  select,
  selectOrdinal,
} from "./runtime-macro"

describe("runtime macro - msg tagged template", () => {
  it("static text", () => {
    expect(msg`Message`).toMatchInlineSnapshot(`
      {
        "id": "xDAtGP",
        "message": "Message",
      }
    `)
  })

  it("positional argument", () => {
    const value = "World"
    expect(msg`Hello ${value}`).toMatchInlineSnapshot(`
      {
        "id": "Y7riaK",
        "message": "Hello {0}",
        "values": {
          "0": "World",
        },
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

  it("multiple positional arguments", () => {
    const a = "foo"
    const b = "bar"
    expect(msg`${a} and ${b}`).toMatchInlineSnapshot(`
      {
        "id": "1N_Dz7",
        "message": "{0} and {1}",
        "values": {
          "0": "foo",
          "1": "bar",
        },
      }
    `)
  })

  it("mixed named and positional arguments", () => {
    const name = "Alice"
    const count = 5
    expect(msg`${{ name }} has ${count} items`).toMatchInlineSnapshot(`
      {
        "id": "Ikoq-P",
        "message": "{name} has {0} items",
        "values": {
          "0": 5,
          "name": "Alice",
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

  it("complex expressions become positional", () => {
    const props = { name: "test" }
    expect(msg`Property ${props.name}, constant ${42}`).toMatchInlineSnapshot(`
      {
        "id": "fox1Gd",
        "message": "Property {0}, constant {1}",
        "values": {
          "0": "test",
          "1": 42,
        },
      }
    `)
  })

  it("no values when only static text", () => {
    const result = msg`Just text`
    expect(result.values).toBeUndefined()
  })
})

describe("runtime macro - msg call expression", () => {
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
})

describe("runtime macro - plural", () => {
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

  it("standalone with positional (unlabeled)", () => {
    expect(plural(5, { one: "# book", other: "# books" }))
      .toMatchInlineSnapshot(`
      {
        "format": "plural",
        "formattedOptions": "one {# book} other {# books}",
        "id": "NzciCK",
        "labeledName": null,
        "message": "{0, plural, one {# book} other {# books}}",
        "nestedValues": {},
        "value": 5,
        "values": {
          "0": 5,
        },
        Symbol(lingui.runtime.marker): true,
      }
    `)
  })

  it("with offset", () => {
    expect(plural({ count: 5 }, { offset: 1, one: "# book", other: "# books" }))
      .toMatchInlineSnapshot(`
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
      plural({ count: 5 }, { 0: "No books", 1: "One book", other: "# books" }),
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

  it("nested in msg with positional", () => {
    expect(msg`There are ${plural(5, { one: "# item", other: "# items" })}`)
      .toMatchInlineSnapshot(`
      {
        "id": "UMhHEP",
        "message": "There are {0, plural, one {# item} other {# items}}",
        "values": {
          "0": 5,
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

describe("runtime macro - select", () => {
  it("standalone with labeled name", () => {
    expect(
      select({ gender: "male" }, { male: "he", female: "she", other: "they" }),
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

describe("runtime macro - selectOrdinal", () => {
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

describe("runtime macro - error handling", () => {
  it("throws on object with multiple properties in msg template", () => {
    expect(() => msg`Hello ${{ first: "a", second: "b" }}`).toThrow(
      "Invalid placeholder at position 0: object has 2 properties (first, second)",
    )
  })

  it("throws on empty object in msg template", () => {
    expect(() => msg`Hello ${{}}`).toThrow(
      "Invalid placeholder at position 0: empty object",
    )
  })

  it("throws on undefined in msg template", () => {
    expect(() => msg`Hello ${undefined}`).toThrow(
      "Invalid placeholder at position 0: value is undefined",
    )
  })

  it("throws on function in msg template", () => {
    expect(() => msg`Hello ${() => "world"}`).toThrow(
      "Invalid placeholder at position 0: value is a function",
    )
  })

  it("reports correct position for errors", () => {
    const name = "Alice"
    expect(() => msg`${{ name }} has ${undefined} items`).toThrow(
      "Invalid placeholder at position 1: value is undefined",
    )
  })

  it("plural throws on undefined first arg", () => {
    expect(() => {
      plural(undefined, { one: "# book", other: "# books" })
    }).toThrow("plural(): first argument is undefined")
  })

  it("plural throws on empty object first arg", () => {
    expect(() => {
      plural({}, { one: "# book", other: "# books" })
    }).toThrow("plural(): first argument is an empty object")
  })

  it("plural throws on multi-property object first arg", () => {
    expect(() => {
      plural({ a: 1, b: 2 }, { one: "# book", other: "# books" })
    }).toThrow("plural(): first argument has 2 properties (a, b)")
  })

  it("select throws on multi-property object first arg", () => {
    expect(() => {
      select({ a: "x", b: "y" }, { male: "he", other: "they" })
    }).toThrow("select(): first argument has 2 properties (a, b)")
  })
})

describe("runtime macro - deep nesting", () => {
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
})

describe("runtime macro - defineMessage alias", () => {
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
