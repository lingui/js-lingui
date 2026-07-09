import { t, plural, select, selectOrdinal } from "./runtime-macro"

describe("runtime macro - t tagged template", () => {
  it("static text", () => {
    expect(t`Message`).toMatchInlineSnapshot(`
      {
        "id": "xDAtGP",
        "message": "Message",
      }
    `)
  })

  it("positional argument", () => {
    const value = "World"
    expect(t`Hello ${value}`).toMatchInlineSnapshot(`
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
    expect(t`Hello ${{ name: value }}`).toMatchInlineSnapshot(`
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
    expect(t`${a} and ${b}`).toMatchInlineSnapshot(`
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
    expect(t`${{ name }} has ${count} items`).toMatchInlineSnapshot(`
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
    expect(t`${{ name }} and ${{ name }}`).toMatchInlineSnapshot(`
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
    expect(t`Property ${props.name}, constant ${42}`).toMatchInlineSnapshot(`
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
    const result = t`Just text`
    expect(result.values).toBeUndefined()
  })
})

describe("runtime macro - t call expression", () => {
  it("with message only", () => {
    expect(t({ message: "Hello" })).toMatchInlineSnapshot(`
      {
        "id": "uzTaYi",
        "message": "Hello",
      }
    `)
  })

  it("with custom id", () => {
    expect(t({ id: "custom.id", message: "Hello" })).toMatchInlineSnapshot(`
      {
        "id": "custom.id",
        "message": "Hello",
      }
    `)
  })

  it("with context generates different id", () => {
    const withoutCtx = t({ message: "Hello" })
    const withCtx = t({ message: "Hello", context: "my custom" })
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
      t({
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

  it("nested in t with labeled name", () => {
    const count = 5
    expect(
      t`There are ${plural({ count }, { one: "# item", other: "# items" })}`,
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

  it("nested in t with positional", () => {
    expect(t`There are ${plural(5, { one: "# item", other: "# items" })}`)
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

  it("nested in t alongside other expressions", () => {
    const name = "shelf"
    const count = 3
    expect(
      t`${{ name }} has ${plural({ count }, { one: "# item", other: "# items" })}`,
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

  it("nested in t", () => {
    const gender = "female"
    expect(
      t`User is ${select({ gender }, { male: "he", female: "she", other: "they" })}`,
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

  it("nested in t", () => {
    const count = 3
    expect(
      t`This is my ${selectOrdinal({ count }, { one: "#st", two: "#nd", other: "#th" })} cat`,
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

  it("t with multiple nested macros", () => {
    const count = 5
    const gender = "female"
    expect(
      t`${plural({ count }, { one: "# item", other: "# items" })} for ${select({ gender }, { male: "him", female: "her", other: "them" })}`,
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
