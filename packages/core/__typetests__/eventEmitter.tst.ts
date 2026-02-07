import { EventEmitter } from "../src/eventEmitter"
import { expect } from "tstyche"

type MissingMessageEvent = {
  locale: string
  id: string
}

type Events = {
  change: () => void
  missing: (event: MissingMessageEvent) => void
}

const emitter = new EventEmitter<Events>()

// Correct usage
expect(emitter.on).type.toBeCallableWith("change", () => {})
expect(emitter.emit).type.toBeCallableWith("change")
expect(emitter.emit).type.toBeCallableWith("missing", {
  locale: "en",
  id: "msg.id",
})

// Should reject mismatched types
expect(emitter.on).type.not.toBeCallableWith(
  "change",
  (_event: MissingMessageEvent) => {},
)
expect(emitter.emit).type.not.toBeCallableWith("missing", "wrong")
