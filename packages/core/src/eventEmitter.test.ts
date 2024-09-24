import { describe, expect, it, vi } from "vitest";
import { EventEmitter } from "./eventEmitter"

describe("@lingui/core/eventEmitter", () => {
  it("should call registered event listeners on emit", async () => {
    const firstListener = vi.fn()
    const secondListener = vi.fn(() => "return value is ignored")

    const emitter = new EventEmitter()
    emitter.on("test", firstListener)
    emitter.on("test", secondListener)

    emitter.emit("test", 42)

    expect(firstListener).toBeCalledWith(42)
    expect(secondListener).toBeCalledWith(42)
  })

  it("should allow unsubscribing from events", () => {
    const listener = vi.fn()
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
    const unknown = vi.fn()

    const emitter = new EventEmitter()
    // this should not throw
    emitter.emit("test", 42)
    // this should not throw
    emitter.removeListener("test", unknown)

    emitter.on("test", vi.fn())
    // this should not throw
    emitter.removeListener("test", unknown)
  })
})
