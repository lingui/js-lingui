import { describe, expect, it } from "vitest";
import { parse } from "./query-string"

describe("query-string", function () {
  describe("#parse", function () {
    it("is exposed as method", function () {
      expect(typeof parse).toBe("function")
    })

    it("will parse a querystring to an object", function () {
      const obj: Record<string, unknown> = parse("foo=bar")

      expect(typeof obj).toBe("object")
      expect(obj.foo).toEqual("bar")
    })

    it("will also work if querystring is prefixed with ?", function () {
      const obj: Record<string, unknown> = parse("?foo=bar&shizzle=mynizzle")

      expect(typeof obj).toBe("object")
      expect(obj.foo).toEqual("bar")
      expect(obj.shizzle).toEqual("mynizzle")
    })

    it("will also work if querystring is prefixed with #", function () {
      const obj: Record<string, unknown> = parse("#foo=bar&shizzle=mynizzle")

      expect(typeof obj).toBe("object")
      expect(obj.foo).toEqual("bar")
      expect(obj.shizzle).toEqual("mynizzle")
    })

    it("does not overide prototypes", function () {
      const obj: Record<string, unknown> = parse("?toString&__proto__=lol")

      expect(typeof obj).toBe("object")
      expect(typeof obj.toString).toBe("function")
    })

    it("works with querystring parameters without values", function () {
      const obj: Record<string, unknown> = parse("?foo&bar=&shizzle=mynizzle")

      expect(typeof obj).toBe("object")
      expect(obj.foo).toEqual("")
      expect(obj.bar).toEqual("")
      expect(obj.shizzle).toEqual("mynizzle")
    })

    it("first value wins", function () {
      const obj: Record<string, unknown> = parse("foo=1&foo=2")

      expect(obj.foo).toEqual("1")
    })

    it("decodes plus signs", function () {
      let obj: Record<string, unknown> = parse("foo+bar=baz+qux")

      expect(typeof obj).toBe("object")
      expect(obj["foo bar"]).toEqual("baz qux")

      obj = parse("foo+bar=baz%2Bqux")

      expect(typeof obj).toBe("object")
      expect(obj["foo bar"]).toEqual("baz+qux")
    })

    it("does not throw on invalid input", function () {
      const obj: Record<string, unknown> = parse("?%&")

      expect(typeof obj).toBe("object")
    })

    it("does not include invalid output", function () {
      const obj: Record<string, unknown> = parse("?%&")

      expect(typeof obj).toBe("object")
      expect(obj).toStrictEqual({})
      expect(Object.keys(obj)).toHaveLength(0)
    })
  })
})
