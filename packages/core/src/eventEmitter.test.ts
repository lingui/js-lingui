import { EventEmitter } from "./eventEmitter"

describe("@lingui/core/eventEmitter", () => {
  it("should call registered event listeners on emit", async () => {
    const firstListener = jest.fn()
    const secondListener = jest.fn(() => "return value is ignored")

    const emitter = new EventEmitter()
    emitter.on("test", firstListener)
    emitter.on("test", secondListener)

    emitter.emit("test", 42)

    expect(firstListener).toBeCalledWith(42)
    expect(secondListener).toBeCalledWith(42)
  })

  it("should allow unsubscribing from events", () => {
    const listener = jest.fn()
    const emitter = new EventEmitter()

    const unsubscribe = emitter.on("test", listener)
    emitter.emit("test", 42)
    expect(listener).toBeCalledWith(42)

    listener.mockReset()
    unsubscribe()
    emitter.emit("test", 42)
    expect(listener).not.toBeCalled()
  })

  it("should do nothing when even doesn't exist", () => {
    const unknown = jest.fn()

    const emitter = new EventEmitter()
    // this should not throw
    emitter.emit("test", 42)
    // this should not throw
    emitter.removeListener("test", unknown)

    emitter.on("test", jest.fn())
    // this should not throw
    emitter.removeListener("test", unknown)
  })
})
