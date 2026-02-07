import { EventEmitter } from "../src/eventEmitter"
import { expect } from "tstyche"

type TestEvents = {
  userLogin: (userId: string) => void
  userLogout: (timestamp: number) => void
}

const emitter = new EventEmitter<TestEvents>()

// Correct usage
expect(emitter.on).type.toBeCallableWith("userLogin", (_userId: string) => {})
expect(emitter.emit).type.toBeCallableWith("userLogin", "user123")

// Should reject mismatched types
expect(emitter.on).type.not.toBeCallableWith("userLogin", (_n: number) => {})
expect(emitter.emit).type.not.toBeCallableWith("userLogin", 12345)
