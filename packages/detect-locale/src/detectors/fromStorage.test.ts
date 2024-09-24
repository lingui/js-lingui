import { describe, expect, it } from "vitest";
import { fromStorage } from ".."

describe("fromStorage detector", () => {
  it("should return a correct value from the local storage stored", () => {
    localStorage.setItem("lang", "es_ES")
    expect(fromStorage("lang")).toEqual("es_ES")
    localStorage.setItem("lang", null)
    expect(fromStorage("lang")).toEqual("null")
  })

  it("should return a correct value from the session storage if opts passed", () => {
    sessionStorage.setItem("lang", "en_EN")
    expect(fromStorage("lang", { useSessionStorage: true })).toEqual("en_EN")
    sessionStorage.setItem("lang", null)
    expect(fromStorage("lang", { useSessionStorage: true })).toEqual("null")
  })
})
