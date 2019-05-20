import { Messages } from "./messages"

describe("Messages", () => {
  it("should create object with lazy translations", () => {
    const catalog = {
      simple: "Default message",
      descriptor: {
        id: "msg.params",
        message: "Message with ID and {param}"
      }
    }
    const messages = Messages.from(catalog)

    expect(typeof messages.simple).toEqual("function")
    expect(typeof messages.descriptor).toEqual("function")
    // @ts-ignore
    expect(messages.xyz).toBeUndefined()

    const i18n = {
      _: jest.fn()
    }
    messages.bind(i18n)
    messages.simple()
    expect(i18n._).toBeCalledWith("Default message", undefined)

    messages.descriptor({ param: 42 })
    expect(i18n._).toBeCalledWith(
      {
        id: "msg.params",
        message: "Message with ID and {param}"
      },
      { param: 42 }
    )
  })

  it("shouldn't allow define messages for bind and i18n keys", () => {
    expect(() =>
      Messages.from({
        i18n: "name conflict"
      })
    ).toThrow()

    expect(() =>
      Messages.from({
        bind: "name conflict"
      })
    ).toThrow()
  })
})
