import { date, number } from "./formats"

describe("@lingui/core/formats", () => {
  it("number formatter is memoized", async () => {
    const firstRunt0 = performance.now()
    number("es", {})(10000)
    const firstRunt1 = performance.now()
    const firstRunResult = firstRunt1 - firstRunt0

    const seconddRunt0 = performance.now()
    number("es", {})(10000)
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
    date("es", {})(new Date())
    const seconddRunt1 = performance.now()
    const secondRunResult = seconddRunt1 - seconddRunt0

    expect(secondRunResult).toBeLessThan(firstRunResult)
  })

  it("memoized function is faster than standard arg in a iteration", () => {
    const loopt0 = performance.now()
    for (let i = 0; i < 1000; i++) {
      date("es", {})(new Date())
    }
    const loopt1 = performance.now()
    const loopResult = loopt1 - loopt0

    const loop0 = performance.now()
    for (let i = 0; i < 1000; i++) {
      date("es", {}, false)(new Date())
    }
    const loop1 = performance.now()
    const withoutMemoizeResult = loop1 - loop0

    console.table({ loopResult, withoutMemoizeResult })
    expect(loopResult).toBeLessThan(withoutMemoizeResult)
  })
})
