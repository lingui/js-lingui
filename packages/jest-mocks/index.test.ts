import { mockEnv, mockConsole } from "./index"

describe("mocks - testing utilities", () => {
  describe("mockEnv", () => {
    it("should mock NODE_ENV", () => {
      expect(process.env.NODE_ENV).not.toEqual("xyz")
      mockEnv("xyz", () => {
        expect(process.env.NODE_ENV).toEqual("xyz")
      })
      expect(process.env.NODE_ENV).not.toEqual("xyz")
    })

    it("should restore original NODE_ENV or error", () => {
      expect(process.env.NODE_ENV).not.toEqual("xyz")

      expect(() =>
        mockEnv("xyz", () => expect(true).toBeFalsy())
      ).toThrowError()

      expect(process.env.NODE_ENV).not.toEqual("xyz")
    })
  })

  describe("mockConsole", () => {
    it("should mock console object and return result", () => {
      expect.assertions(4)
      const originalConsole = console

      const result = mockConsole(() => {
        expect(vi.mocked(console.log).mock).toBeTruthy()
        return "result"
      })

      expect(result).toEqual("result")
      expect(console.log).toEqual(originalConsole.log)
      expect(vi.mocked(console.log).mock).toBeUndefined()
    })

    it("should mock console object and return async result", async () => {
      expect.assertions(4)
      const originalConsole = console

      const result = await mockConsole(async () => {
        expect(vi.mocked(console.log).mock).toBeTruthy()
        return "result"
      })

      expect(result).toEqual("result")
      expect(console.log).toEqual(originalConsole.log)
      expect(vi.mocked(console.log).mock).toBeUndefined()
    })

    it("should restore original console methods on error", () => {
      const originalConsole = console

      expect(() =>
        mockConsole(() => {
          throw new Error("")
        })
      ).toThrowError()

      expect(vi.mocked(console.log).mock).toBeUndefined()

      expect(console.log).toEqual(originalConsole.log)
    })

    it("should restore original methods and return result in async function", async () => {
      const originalConsole = console

      await expect(
        async () =>
          await mockConsole(async () => {
            throw new Error("Dummy Error")
          })
      ).rejects.toThrowError("Dummy Error")

      expect(vi.mocked(console.log).mock).toBeUndefined()
      expect(console.log).toEqual(originalConsole.log)
    })
  })
})
