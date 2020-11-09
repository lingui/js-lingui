import { date, number } from "./formats"

describe("@lingui/core/formats", () => {
  it("number formatter is memoized", async () => {
    const firstRunt0 = performance.now()
    number("es", {})(10000)
    const firstRunt1 = performance.now()
    const firstRunResult = firstRunt1 - firstRunt0

    const seconddRunt0 = performance.now()
    number("es", {}, false)(10000)
    const seconddRunt1 = performance.now()
    const secondRunResult = seconddRunt1 - seconddRunt0

    expect(secondRunResult).toBeLessThan(firstRunResult)
  })
  it("date formatter is memoized", async () => {
    const firstRunt0 = performance.now()
    date("es", {})(new Date())
    const firstRunt1 = performance.now()
    const firstRunResult = firstRunt1 - firstRunt0

    const seconddRunt0 = performance.now()
    date("es", {}, false)(new Date())
    const seconddRunt1 = performance.now()
    const secondRunResult = seconddRunt1 - seconddRunt0

    expect(secondRunResult).toBeLessThan(firstRunResult)
  })
})
