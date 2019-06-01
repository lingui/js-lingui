import { EventEmitter } from "./eventEmitter"

describe("@lingui/core/eventEmitter", () => {
  it("should call registered event listeners on emit", async () => {
    const withoutResponse = jest.fn()
    const withSyncResponse = jest.fn(() => "sync")
    const withAsyncResponse = jest.fn(() => Promise.resolve("async"))

    const emitter = new EventEmitter()
    emitter.on("test", withoutResponse)
    emitter.on("test", withSyncResponse)
    emitter.on("test", withAsyncResponse)

    const result = await emitter.emit("test", 42)

    expect(withoutResponse).toBeCalledWith(42)
    expect(withSyncResponse).toBeCalledWith(42)
    expect(withAsyncResponse).toBeCalledWith(42)
    expect(result).toEqual([undefined, "sync", "async"])
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

  it("emit should always return a promise", () => {
    const emitter = new EventEmitter()
    const response = emitter.emit("test", 42)
    expect(response.then).toBeDefined()
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
