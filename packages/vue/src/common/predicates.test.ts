import { isTrans, isVtDirectiveNode } from "./predicates"
import { run } from "../test/utils"

//

describe("isTrans", () => {
  it("should return true when valid <Trans> with children", () => {
    run(
      `
      <Trans>Hello world!</Trans>
    `,
      (node) => {
        expect(isTrans(node)).toEqual(true)
      }
    )
  })

  it("should return false when <Trans> with no children", () => {
    run(
      `
      <Trans></Trans>
    `,
      (node) => {
        expect(isTrans(node)).toEqual(false)
      }
    )
  })

  it("should return false when not a <Trans>", () => {
    run(
      `
      <Translation></Translation>
    `,
      (node) => {
        expect(isTrans(node)).toEqual(false)
      }
    )
  })
})

describe("isVtDirectiveNode", () => {
  it("should return true when node is a prop directive node containing vt call", () => {
    run(
      `
      <img :alt="vt\`John's avatar\`" src="https://some.serv/picture.jpg" />
    `,
      (node) => {
        const prop = node.props[0]
        expect(isVtDirectiveNode(prop)).toEqual(true)
      }
    )
  })

  it("should return true when node is a prop directive node containing vt call with variable", () => {
    run(
      `
      <img :alt="vt\`\${username}'s avatar\`" src="https://some.serv/picture.jpg" />
    `,
      (node) => {
        const prop = node.props[0]
        expect(isVtDirectiveNode(prop)).toEqual(true)
      }
    )
  })

  it("should return false when node is a prop directive node containing a ternary expression with some valid vt call in it (for now)", () => {
    run(
      `
      <img :alt="username ? vt\`{username}'s avatar\` : vt\`John's avatar\`" src="https://some.serv/picture.jpg" />
    `,
      (node) => {
        const prop = node.props[0]
        expect(isVtDirectiveNode(prop)).toEqual(false)
      }
    )
  })

  it("should return false when node is a prop attribute (not a directive) node containing vt call", () => {
    run(
      `
      <img alt="vt\`John's avatar\`" src="https://some.serv/picture.jpg" />
    `,
      (node) => {
        const prop = node.props[0]
        expect(isVtDirectiveNode(prop)).toEqual(false)
      }
    )
  })

  it("should return false when node is a prop directive node containing a wrong vt call", () => {
    run(
      `
      <img :alt="vt(\`John's avatar\`)" src="https://some.serv/picture.jpg" />
    `,
      (node) => {
        const prop = node.props[0]
        expect(isVtDirectiveNode(prop)).toEqual(false)
      }
    )
  })

  it("should return false when node is a prop directive node containing somthing similar to vt call", () => {
    run(
      `
      <img :alt="notvt\`John's avatar\`" src="https://some.serv/picture.jpg" />
    `,
      (node) => {
        const prop = node.props[0]
        expect(isVtDirectiveNode(prop)).toEqual(false)
      }
    )
  })
})
