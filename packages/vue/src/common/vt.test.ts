import { run } from "../test/utils"
import { getContent, getVtDirectiveProps } from "./vt"

//

describe("getVtDirectiveProps", () => {
  it("should get all props", () => {
    run(
      '<img :title="vt`some title`" :alt="vt`some alt`" src="" />',
      (node) => {
        expect(getVtDirectiveProps(node).length).toEqual(2)
      }
    )
  })

  it("should get no props", () => {
    run(
      '<img :title="t`some title`" alt="vt`some alt`" src="" :label="some.vt`label`" />',
      (node) => {
        expect(getVtDirectiveProps(node).length).toEqual(0)
      }
    )
  })
})

describe("getContent", () => {
  it("should return the content of a vt call", () => {
    run('<img :title="vt`some random title`" src="" />', (node) => {
      const prop = getVtDirectiveProps(node)[0]
      if (!prop) throw new Error()
      expect(getContent(prop)).toEqual("some random title")
    })
  })

  it("should return the content without blank", () => {
    run('<img :title="vt`   some random title   `" src="" />', (node) => {
      const prop = getVtDirectiveProps(node)[0]
      if (!prop) throw new Error()
      expect(getContent(prop)).toEqual("some random title")
    })
  })

  it("should return the content without blank", () => {
    run(
      `
      <img :title="vt\`
         some random title   \`" src="" />
    `,
      (node) => {
        const prop = getVtDirectiveProps(node)[0]
        if (!prop) throw new Error()
        expect(getContent(prop)).toEqual("some random title")
      }
    )
  })

  it("should return the content even with emojis", () => {
    run('<img :title="vt`some random ❤️ title 😁`" src="" />', (node) => {
      const prop = getVtDirectiveProps(node)[0]
      if (!prop) throw new Error()
      expect(getContent(prop)).toEqual("some random ❤️ title 😁")
    })
  })

  it("should return the content with named placeholder when var", () => {
    run('<img :title="vt`Hello ${name}`" src="" />', (node) => {
      const prop = getVtDirectiveProps(node)[0]
      if (!prop) throw new Error()
      expect(getContent(prop)).toEqual("Hello {0}")
    })
  })

  it("should return the content with all named placeholder when var", () => {
    run(
      '<img :title="vt`Hello ${name} welcome to ${town} you are now a ${persona}!`" src="" />',
      (node) => {
        const prop = getVtDirectiveProps(node)[0]
        if (!prop) throw new Error()
        expect(getContent(prop)).toEqual(
          "Hello {0} welcome to {1} you are now a {2}!"
        )
      }
    )
  })

  it("should handle complex interpolation with placeholder", () => {
    run(
      '<img :title="vt`Hello ${name ? name : \'John\'} welcome to ${town}`" src="" />',
      (node) => {
        const prop = getVtDirectiveProps(node)[0]
        if (!prop) throw new Error()
        expect(getContent(prop)).toEqual("Hello {0} welcome to {1}")
      }
    )
  })
})
