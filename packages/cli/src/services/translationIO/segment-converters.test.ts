import { MessageType } from "@lingui/conf"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import {
  createSegmentFromLinguiItem,
  createLinguiItemFromSegment,
} from "./segment-converters.js"
import { TranslationIoSegment } from "./translationio-api.js"

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

      expect(segment).toMatchInlineSnapshot(`
        {
          comment: ,
          context: ,
          references: [
            src/App.tsx:15,
          ],
          source: Hello {name},
          type: source,
        }
      `)
    })

    it("should create segment from Lingui item with explicit ID", () => {
      const key = "app.welcome"
      const item: MessageType = {
        translation: "Welcome to our app",
        message: "Welcome to our app",
        origin: [["src/App.tsx", 10]],
        comments: ["Comment from code"],
      }

      const segment = createSegmentFromLinguiItem(key, item)

      expect(segment).toMatchInlineSnapshot(`
        {
          comment: js-lingui-explicit-id | Comment from code,
          context: app.welcome,
          references: [
            src/App.tsx:10,
          ],
          source: Welcome to our app,
          type: source,
        }
      `)
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

      expect(segment).toMatchInlineSnapshot(`
        {
          comment: ,
          context: navigation,
          references: [
            src/App.tsx:20,
          ],
          source: Home,
          type: source,
        }
      `)
    })

    it("should create segment from Lingui item with explicit ID and context", () => {
      const key = "about.title"
      const item: MessageType = {
        translation: "About Us",
        message: "About Us",
        context: "this is a context",
        origin: [["src/About.tsx", 5]],
        comments: ["Comment from code"],
      }

      const segment = createSegmentFromLinguiItem(key, item)

      expect(segment).toMatchInlineSnapshot(`
        {
          comment: this is a context | js-lingui-explicit-id-and-context | Comment from code,
          context: about.title,
          references: [
            src/About.tsx:5,
          ],
          source: About Us,
          type: source,
        }
      `)
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
      expect(item).toMatchInlineSnapshot(`
        {
          comments: [],
          context: greeting,
          message: Hello {name},
          origin: [
            [
              src/App.tsx,
              15,
            ],
          ],
          translation: Bonjour {name},
        }
      `)
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
      expect(item).toMatchInlineSnapshot(`
        {
          comments: [],
          message: Welcome to our app,
          origin: [
            [
              src/App.tsx,
              10,
            ],
          ],
          translation: Bienvenue dans notre application,
        }
      `)
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
      expect(item).toMatchInlineSnapshot(`
        {
          comments: [],
          context: page.about,
          message: About Us,
          origin: [
            [
              src/About.tsx,
              5,
            ],
          ],
          translation: À propos,
        }
      `)
    })
  })

  describe("Round-trip conversion", () => {
    it("should maintain data integrity through Lingui item -> segment -> Lingui item conversion", () => {
      const originalKey = "test.message"
      const originalItem: MessageType = {
        translation: "Test Message",
        message: "Test Message",
        context: "context",
        comments: [],
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
