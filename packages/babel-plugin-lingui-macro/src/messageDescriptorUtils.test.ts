import * as types from "@babel/types"
import { createMessageDescriptor } from "./messageDescriptorUtils"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

function getIdPropertyValue(
  descriptor: ReturnType<typeof createMessageDescriptor>,
) {
  const idProp = descriptor.properties[0] as types.ObjectProperty
  return (idProp.value as types.StringLiteral).value
}

describe("createMessageDescriptor", () => {
  it.each([
    {
      name: "prefixes explicit ids when idPrefixLeader is unset",
      defaults: {
        id: { text: "greeting" },
        idPrefix: "module.",
      },
      expectedId: "module.greeting",
    },
    {
      name: "leaves explicit ids unchanged when idPrefix is missing",
      defaults: {
        id: { text: "greeting" },
      },
      expectedId: "greeting",
    },
    {
      name: "prefixes explicit ids that include the configured idPrefixLeader",
      defaults: {
        id: { text: ".greeting" },
        idPrefix: "module",
        idPrefixLeader: ".",
      },
      expectedId: "module.greeting",
    },
    {
      name: "leaves explicit ids unchanged when they do not include the configured idPrefixLeader",
      defaults: {
        id: { text: "greeting" },
        idPrefix: "module.",
        idPrefixLeader: "@@",
      },
      expectedId: "greeting",
    },
  ])("$name", ({ defaults, expectedId }) => {
    const descriptor = createMessageDescriptor(
      { message: "Hello" },
      undefined,
      "all",
      defaults,
    )

    expect(getIdPropertyValue(descriptor)).toBe(expectedId)
  })

  it("generates the hash id when no explicit id is provided", () => {
    const descriptor = createMessageDescriptor(
      { message: "Hello" },
      undefined,
      "all",
      {
        idPrefix: "module.",
        idPrefixLeader: "@@",
      },
    )

    expect(getIdPropertyValue(descriptor)).toBe(generateMessageId("Hello"))
  })

  it("preserves object-property ids when prefixing does not apply", () => {
    const idProperty = types.objectProperty(
      types.identifier("id"),
      types.stringLiteral("greeting"),
    )
    const descriptor = createMessageDescriptor(
      { message: "Hello" },
      undefined,
      "all",
      {
        id: idProperty,
        idPrefix: "module.",
        idPrefixLeader: "@@",
      },
    )

    expect(descriptor.properties[0]).toBe(idProperty)
  })

  it("throws when an explicit object-property id is dynamic", () => {
    const idProperty = types.objectProperty(
      types.identifier("id"),
      types.identifier("dynamicId"),
    )

    expect(() =>
      createMessageDescriptor({ message: "Hello" }, undefined, "all", {
        id: idProperty,
      }),
    ).toThrow("Message id must be a static string literal")
  })
})
