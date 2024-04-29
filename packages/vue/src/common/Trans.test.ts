import { getContent, getContext, getId } from "./Trans"
import { run } from "../test/utils"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

//

describe("getContext", () => {
  it("should get the context", () => {
    run(
      `
      <Trans context="direction">right</Trans>
    `,
      (node) => {
        expect(getContext(node)).toEqual("direction")
      }
    )
  })

  it("should return undefined when context is empty", () => {
    run(
      `
      <Trans context="">right</Trans>
    `,
      (node) => {
        expect(getContext(node)).toEqual(undefined)
      }
    )
  })

  it("should return undefined when context is a directive", () => {
    run(
      `
      <Trans :context="direction">right</Trans>
    `,
      (node) => {
        expect(getContext(node)).toEqual(undefined)
      }
    )
  })

  it("should return undefined when no context", () => {
    run(
      `
      <Trans>right</Trans>
    `,
      (node) => {
        expect(getContext(node)).toEqual(undefined)
      }
    )
  })
})

describe("getId", () => {
  it("should return the given id when set", () => {
    run(
      `
      <Trans id="direction.right">right</Trans>
    `,
      (node) => {
        expect(getId(node, "right")).toEqual("direction.right")
      }
    )
  })

  it("should return the generated id when not set", () => {
    run(
      `
      <Trans>right</Trans>
    `,
      (node) => {
        expect(getId(node, "right")).toEqual(generateMessageId("right"))
      }
    )
  })

  it("should return the generated id when not set but with context", () => {
    run(
      `
      <Trans context="direction">right</Trans>
    `,
      (node) => {
        expect(getId(node, "right")).toEqual(
          generateMessageId("right", "direction")
        )
      }
    )
  })

  it("should return the generated id when id is empty but with context", () => {
    run(
      `
      <Trans id="" context="direction">right</Trans>
    `,
      (node) => {
        expect(getId(node, "right")).toEqual(
          generateMessageId("right", "direction")
        )
      }
    )
  })

  it("should return the generated id when id is empty and context empty", () => {
    run(
      `
      <Trans id="" context="">right</Trans>
    `,
      (node) => {
        expect(getId(node, "right")).toEqual(generateMessageId("right"))
      }
    )
  })

  it("should return the generated id when id is a directive", () => {
    run(
      `
      <Trans :id="direction.right">right</Trans>
    `,
      (node) => {
        expect(getId(node, "right")).toEqual(generateMessageId("right"))
      }
    )
  })
})

describe("getContent", () => {
  it("should return the content of a Trans component", () => {
    run(
      `
      <Trans>This is some random content</Trans>
    `,
      (node) => {
        expect(getContent(node).content).toEqual("This is some random content")
      }
    )
  })

  it("should return the content without blank", () => {
    run(
      `
      <Trans> This is some random content  </Trans>
    `,
      (node) => {
        expect(getContent(node).content).toEqual("This is some random content")
      }
    )
  })

  it("should return the content without line break", () => {
    run(
      `
      <Trans>
          This is some random content  
      </Trans>
    `,
      (node) => {
        expect(getContent(node).content).toEqual("This is some random content")
      }
    )
  })

  it("should return the content with named placeholder when var", () => {
    run(
      `
        <Trans>Hello {{ name }}</Trans>
    `,
      (node) => {
        expect(getContent(node).content).toEqual("Hello {name}")
      }
    )
  })

  it("should return the content with all named placeholder when var", () => {
    run(
      `
        <Trans>Hello {{ name }} welcome to {{ town }} you are now a {{ persona }}!</Trans>
    `,
      (node) => {
        expect(getContent(node).content).toEqual(
          "Hello {name} welcome to {town} you are now a {persona}!"
        )
      }
    )
  })

  it("should return the content with placeholder when inner tag", () => {
    run(
      `
        <Trans>Hello <em>{{ name }}</em> welcome to {{ town }} <br /> <span>you are now <em><i>a {{ persona }}</i></em></span>!</Trans>
    `,
      (node) => {
        expect(getContent(node).content).toEqual(
          "Hello <0>{name}</0> welcome to {town} <1/> <2>you are now <3><4>a {persona}</4></3></2>!"
        )
      }
    )
  })

  it("should return the content with placeholder when contains complex interpolation", () => {
    run(
      `
        <Trans>Hello {{ user.name }}</Trans>
    `,
      (node) => {
        expect(getContent(node).content).toEqual("Hello {0}")
      }
    )
  })

  it("should return the content with placeholders sequentially when contains multiple complex interpolation", () => {
    run(
      `
        <Trans>Hello {{ user ? user : "John" }} and {{ guest.name }}</Trans>
    `,
      (node) => {
        expect(getContent(node).content).toEqual("Hello {0} and {1}")
      }
    )
  })
})
