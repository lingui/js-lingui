import { run } from "../test/utils"
import { visitTrans, visitVt } from "./transformer"
import { getVtDirectiveProps } from "../common/vt"

//

function wasCalledWith(callback: jest.Mock, args: Array<unknown>) {
  expect(callback.mock.calls).toHaveLength(1)
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    expect(callback.mock.calls[0][0]).toEqual(arg)
  }
}

describe("visitTrans", () => {
  it("should call onMessageExtracted with message properties from Trans component", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans>This is some random content</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "cr8mms",
        message: "This is some random content",
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should call onMessageExtracted with given id when present", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans id="random.content">This is some random content</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "random.content",
        message: "This is some random content",
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should call onMessageExtracted with context when present", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans context="direction">right</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "d1wX4r",
        message: "right",
        context: "direction",
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should call onMessageExtracted with values when present", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans>Hello {{ name }} welcome to {{ town }} you are now a {{ persona }}!</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "cc6wEV",
        message: "Hello {name} welcome to {town} you are now a {persona}!",
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should call onMessageExtracted with placeholders when inner tags", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans>Hello <em>{{ name }}</em> welcome to {{ town }} <br /> <span>you are now <em><i>a {{ persona }}</i></em></span>!</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "r0tHqI",
        message:
          "Hello <0>{name}</0> welcome to {town} <1/> <2>you are now <3><4>a {persona}</4></3></2>!",
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should handle simple quotes", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans>John's car is red</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "H3I1xb",
        message: "John's car is red",
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should handle double quotes", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans>This car is "red"</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "HP8WZU",
        message: 'This car is "red"',
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should handle mixed quotes", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans>John's car is "red"</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "dp/IGY",
        message: 'John\'s car is "red"',
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should handle complex interpolation", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans>Hello {{ user.name }}</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "Y7riaK",
        message: "Hello {0}",
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })

  it("should handle multiple complex interpolation", () => {
    const onMessageExtracted = jest.fn()

    run(
      `
      <Trans>Hello {{ user.name }}! Do you love {{ isCatPerson ? "cat" : "dogs" }}?</Trans>
    `,
      (node) => visitTrans(node, onMessageExtracted)
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "EtDOPn",
        message: "Hello {0}! Do you love {1}?",
        context: undefined,
        origin: { line: 2, column: 7 },
      },
    ])
  })
})

describe("visitVt", () => {
  it("should call onMessageExtract with message properties from a prop using vt", () => {
    const onMessageExtracted = jest.fn()

    run('<img :title="vt`some random title`" src="" />', (node) => {
      const prop = getVtDirectiveProps(node)[0]
      if (!prop) throw new Error()
      visitVt(prop, onMessageExtracted)
    })

    wasCalledWith(onMessageExtracted, [
      {
        id: "Zs1Y8r",
        message: "some random title",
        origin: { line: 1, column: 24 },
      },
    ])
  })

  it("should call onMessageExtract with simple values when present", () => {
    const onMessageExtracted = jest.fn()

    run('<img :title="vt`Hello ${name}`" src="" />', (node) => {
      const prop = getVtDirectiveProps(node)[0]
      if (!prop) throw new Error()
      visitVt(prop, onMessageExtracted)
    })

    wasCalledWith(onMessageExtracted, [
      {
        id: "Y7riaK",
        message: "Hello {0}",
        origin: { line: 1, column: 24 },
      },
    ])
  })

  it("should call onMessageExtract with complex interpolation when present", () => {
    const onMessageExtracted = jest.fn()

    run(
      '<img :title="vt`Hello ${name ? name : \'John\'} welcome to ${town}`" src="" />',
      (node) => {
        const prop = getVtDirectiveProps(node)[0]
        if (!prop) throw new Error()
        visitVt(prop, onMessageExtracted)
      }
    )

    wasCalledWith(onMessageExtracted, [
      {
        id: "xEaD71",
        message: "Hello {0} welcome to {1}",
        origin: { line: 1, column: 24 },
      },
    ])
  })
})
