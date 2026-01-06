import { MessageType } from "@lingui/conf"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import {
  createSegmentFromLinguiItem,
  createLinguiItemFromSegment,
} from "./segment-converters"
import { TranslationIoSegment } from "./api-client"

describe("Segment Converters", () => {
  describe("createSegmentFromLinguiItem", () => {
    it("should create segment from regular Lingui item without explicit ID", () => {
      const item: MessageType = {
        translation: "",
        message: "Hello {name}",
        origin: [["src/App.tsx", 15]],
      }
      const key = generateMessageId(item.message)

      const segment = createSegmentFromLinguiItem(key, item)

      expect(segment).toEqual({
        type: "source",
        source: "Hello {name}",
        context: "",
        references: ["src/App.tsx:15"],
        comment: "",
      })
    })

    it("should create segment from Lingui item with explicit ID", () => {
      const key = "app.welcome"
      const item: MessageType = {
        translation: "Welcome to our app",
        message: "Welcome to our app",
        origin: [["src/App.tsx", 10]],
        comments: ["js-lingui-explicit-id"],
      }

      const segment = createSegmentFromLinguiItem(key, item)

      expect(segment).toEqual({
        type: "source",
        source: "Welcome to our app",
        context: "app.welcome",
        references: ["src/App.tsx:10"],
        comment: "js-lingui-explicit-id",
      })
    })

    it("should create segment from Lingui item with context but no explicit ID", () => {
      const item: MessageType = {
        translation: "",
        message: "Home",
        context: "navigation",
        origin: [["src/App.tsx", 20]],
      }

      const key = generateMessageId(item.message, item.context)

      const segment = createSegmentFromLinguiItem(key, item)

      expect(segment).toEqual({
        type: "source",
        source: "Home",
        context: "navigation",
        references: ["src/App.tsx:20"],
        comment: "",
      })
    })

    it("should create segment from Lingui item with explicit ID and context", () => {
      const key = "about.title"
      const item: MessageType = {
        translation: "About Us",
        message: "About Us",
        context: "page.about",
        origin: [["src/About.tsx", 5]],
        comments: ["js-lingui-explicit-id"],
      }

      const segment = createSegmentFromLinguiItem(key, item)

      expect(segment).toEqual({
        type: "source",
        source: "About Us",
        context: "about.title",
        references: ["src/About.tsx:5"],
        comment: "page.about | js-lingui-explicit-id-and-context",
      })
    })
  })

  describe("createLinguiItemFromSegment", () => {
    it("should create Lingui item from segment without explicit ID", () => {
      const segment: TranslationIoSegment = {
        type: "source",
        source: "Hello {name}",
        target: "Bonjour {name}",
        context: "greeting",
        references: ["src/App.tsx:15"],
        comment: "",
      }

      const [id, item] = createLinguiItemFromSegment(segment)

      expect(id).toMatch(/^[a-zA-Z0-9]+$/) // Generated ID
      expect(item).toMatchObject({
        translation: "Bonjour {name}",
        message: "Hello {name}",
        context: "greeting",
        origin: [["src/App.tsx", 15]],
      })
    })

    it("should create Lingui item from segment with explicit ID", () => {
      const segment: TranslationIoSegment = {
        type: "source",
        source: "Welcome to our app",
        target: "Bienvenue dans notre application",
        context: "app.welcome",
        references: ["src/App.tsx:10"],
        comment: "js-lingui-explicit-id",
      }

      const [id, item] = createLinguiItemFromSegment(segment)

      expect(id).toBe("app.welcome")
      expect(item.translation).toBe("Bienvenue dans notre application")
      expect(item.message).toBe("Welcome to our app")
      expect(item.context).toBeUndefined()
      expect(item.comments).toEqual(["js-lingui-explicit-id"])
    })

    it("should create Lingui item from segment with explicit ID and context", () => {
      const segment: TranslationIoSegment = {
        type: "source",
        source: "About Us",
        target: "À propos",
        context: "about.title",
        references: ["src/About.tsx:5"],
        comment: "page.about | js-lingui-explicit-id-and-context",
      }

      const [id, item] = createLinguiItemFromSegment(segment)

      expect(id).toBe("about.title")
      expect(item.translation).toBe("À propos")
      expect(item.message).toBe("About Us")
      expect(item.context).toBe("page.about")
      expect(item.comments).toEqual(["js-lingui-explicit-id"])
    })
  })

  describe("Round-trip conversion", () => {
    it("should maintain data integrity through Lingui item -> segment -> Lingui item conversion", () => {
      const originalKey = "test.message"
      const originalItem: MessageType = {
        translation: "Test Message",
        message: "Test Message",
        context: "context",
        comments: ["js-lingui-explicit-id"],
        origin: [["src/test.ts", 10]],
      }

      const segment = createSegmentFromLinguiItem(originalKey, originalItem)
      segment.target = "Message de test"

      const [newKey, newItem] = createLinguiItemFromSegment(segment)

      expect(newKey).toBe(originalKey)
      expect(newItem.comments).toEqual(originalItem.comments)
      expect(newItem.origin).toEqual(originalItem.origin)
      expect(newItem.translation).toBe("Message de test")
    })

    it("should maintain data integrity through Lingui item -> segment -> Lingui item conversion with generated id", () => {
      const originalItem: MessageType = {
        translation: "Test Message",
        message: "Test Message",
        context: "context",
        comments: [],
        origin: [["src/test.ts", 10]],
      }

      const originalKey = generateMessageId(
        originalItem.message,
        originalItem.context
      )

      const segment = createSegmentFromLinguiItem(originalKey, originalItem)
      segment.target = "Message de test"

      const [newKey, newItem] = createLinguiItemFromSegment(segment)

      expect(newKey).toBe(originalKey)
      expect(newItem.comments).toEqual(originalItem.comments)
      expect(newItem.origin).toEqual(originalItem.origin)
      expect(newItem.translation).toBe("Message de test")
    })
  })
})
