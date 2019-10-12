import { mockEnv, mockConsole } from "./index"

describe("mocks - testing utilities", function() {
  describe("mockEnv", function() {
    it("should mock NODE_ENV", function() {
      expect(process.env.NODE_ENV).not.toEqual("xyz")
      mockEnv("xyz", () => {
        expect(process.env.NODE_ENV).toEqual("xyz")
      })
      expect(process.env.NODE_ENV).not.toEqual("xyz")
    })

    it("should restore original NODE_ENV or error", function() {
      expect(process.env.NODE_ENV).not.toEqual("xyz")

      expect(() =>
        mockEnv("xyz", () => expect(true).toBeFalsy())
      ).toThrowError()

      expect(process.env.NODE_ENV).not.toEqual("xyz")
    })
  })

  describe("mockConsole", function() {
    it("should mock console object", function() {
      expect(typeof console.log).toEqual("function")

      mockConsole(
        () => {
          expect(typeof console.log).toEqual("string")
        },
        { log: "log" }
      )
      expect(typeof console.log).toEqual("function")
    })

    it("should restore original NODE_ENV or error", function() {
      expect(typeof console.log).toEqual("function")

      expect(() =>
        mockConsole(() => expect(true).toBeFalsy(), { log: "log" })
      ).toThrowError()

      expect(typeof console.log).toEqual("function")
    })
  })
})
