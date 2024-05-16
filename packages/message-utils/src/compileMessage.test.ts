import { mockConsole } from "@lingui/jest-mocks"
import { compileMessage } from "./compileMessage"

describe("compileMessage", () => {
  it("should handle an error if message has syntax errors", () => {
    mockConsole((console) => {
      expect(compileMessage("Invalid {message")).toEqual("Invalid {message")
      expect(console.error).toBeCalledWith(
        expect.stringMatching("Unexpected message end at line")
      )
    })
  })

  it("should process string chunks with provided map fn", () => {
    const tokens = compileMessage(
      "Message {value, plural, one {{value} Book} other {# Books}}",
      (text) => `<${text}>`
    )
    expect(tokens).toEqual([
      "<Message >",
      [
        "value",
        "plural",
        {
          one: [["value"], "< Book>"],
          other: ["#", "< Books>"],
        },
      ],
    ])
  })

  it("should compileMessage static message", () => {
    const tokens = compileMessage("Static message")
    expect(tokens).toEqual("Static message")
  })

  it("should compileMessage message with variable", () => {
    const tokens = compileMessage("Hey {name}!")
    expect(tokens).toMatchInlineSnapshot(`
      [
        Hey ,
        [
          name,
        ],
        !,
      ]
    `)
  })

  it("should not interpolate escaped placeholder", () => {
    const tokens = compileMessage("Hey '{name}'!")
    expect(tokens).toMatchInlineSnapshot(`Hey {name}!`)
  })

  it("should compile plurals", () => {
    const tokens = compileMessage(
      "{value, plural, offset:1 =0 {No Books} one {# Book} other {# Books} =42 {FourtyTwo books} =99 {Books with problems}}"
    )
    expect(tokens).toMatchInlineSnapshot(`
      [
        [
          value,
          plural,
          {
            0: No Books,
            42: FourtyTwo books,
            99: Books with problems,
            offset: 1,
            one: [
              #,
               Book,
            ],
            other: [
              #,
               Books,
            ],
          },
        ],
      ]
    `)
  })

  it("should compile selectordinal", () => {
    const tokens = compileMessage(
      "{value, selectordinal, one {#st Book} two {#nd Book}}"
    )
    expect(tokens).toMatchInlineSnapshot(`
      [
        [
          value,
          selectordinal,
          {
            offset: undefined,
            one: [
              #,
              st Book,
            ],
            two: [
              #,
              nd Book,
            ],
          },
        ],
      ]
    `)
  })

  it("should compile nested choice components", () => {
    const tokens = compileMessage(
      `{
      gender, select,
      male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}}
      female {{numOfGuests, plural, one {She invites one guest} other {She invites # guests}}}
      other {They is {gender}}}`
    )
    expect(tokens).toMatchInlineSnapshot(`
      [
        [
          gender,
          select,
          {
            female: [
              [
                numOfGuests,
                plural,
                {
                  offset: undefined,
                  one: She invites one guest,
                  other: [
                    She invites ,
                    #,
                     guests,
                  ],
                },
              ],
            ],
            male: [
              [
                numOfGuests,
                plural,
                {
                  offset: undefined,
                  one: He invites one guest,
                  other: [
                    He invites ,
                    #,
                     guests,
                  ],
                },
              ],
            ],
            offset: undefined,
            other: [
              They is ,
              [
                gender,
              ],
            ],
          },
        ],
      ]
    `)
  })

  it("should compile select", () => {
    const tokens = compileMessage("{value, select, female {She} other {They}}")
    expect(tokens).toMatchInlineSnapshot(`
      [
        [
          value,
          select,
          {
            female: She,
            offset: undefined,
            other: They,
          },
        ],
      ]
    `)
  })

  it("should compile date", () => {
    const tokens = compileMessage("{value, date}")
    expect(tokens).toMatchInlineSnapshot(`
      [
        [
          value,
          date,
        ],
      ]
    `)
  })

  it("should compile number", () => {
    expect(compileMessage("{value, number, percent}")).toMatchInlineSnapshot(`
      [
        [
          value,
          number,
          percent,
        ],
      ]
    `)
    expect(compileMessage("{value, number}")).toMatchInlineSnapshot(`
      [
        [
          value,
          number,
        ],
      ]
    `)
  })
})
