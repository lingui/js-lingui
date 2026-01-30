import { parseExamples, fillRange } from "./parseExamples"

describe("Plural samples generation util", () => {
  test.each([
    ["0~1", [0, 1]],
    ["2~19", [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]],
    ["100~102", [100, 101, 102]],
  ])("fillRange - integer ranges", (range, values) => {
    expect(fillRange(range)).toEqual(values)
  })

  test.each([
    ["0.0~1.0", [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]],
    // partials
    [
      "0.4~1.6",
      [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
    ],
    ["0.04~0.09", [0.04, 0.05, 0.06, 0.07, 0.08, 0.09]],
    [
      "0.04~0.29",
      [
        0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15,
        0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27,
        0.28, 0.29,
      ],
    ],
  ])("fillRange - decimal ranges", (range, values) => {
    expect(fillRange(range)).toEqual(values)
  })

  test("createSamples - single values", () => {
    expect(parseExamples("0")).toEqual([0])
    expect(parseExamples("0, 1, 2")).toEqual([0, 1, 2])
    expect(parseExamples("0, 1.0, 2.0")).toEqual([0, 1, 2])
  })

  test("createSamples - integer ranges", () => {
    expect(parseExamples("0~1")).toEqual([0, 1])
    expect(parseExamples("0~2")).toEqual([0, 1, 2])
    expect(parseExamples("0~10")).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(parseExamples("2~17, 100, 1000, 10000, 100000, 1000000")).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 100, 1000, 10000,
      100000, 1000000,
    ])
  })

  test("createSamples - big numbers", () => {
    expect(parseExamples("1c3, 2c4, 3c6")).toEqual([1000, 20000, 3000000])
  })

  test("createSamples - mixed src", () => {
    expect(parseExamples("0.1~0.9")).toEqual([
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])
    // with ...
    expect(
      parseExamples("0, 2~16, 100, 1000, 10000, 100000, 1000000, …"),
    ).toEqual([
      0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 100, 1000, 10000,
      100000, 1000000,
    ])
    // mixed with integer ranges
    expect(
      parseExamples("0.1~0.9, 1.1~1.7, 10.0, 100.0, 1000.0, 10000.0, 100000.0"),
    ).toEqual([
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6,
      1.7, 10, 100, 1000, 10000, 100000,
    ])
    // trailing comma
    expect(
      parseExamples(
        "0.1~0.9, 1.1~1.7, 10.0, 100.0, 1000.0, 10000.0, 100000.0,",
      ),
    ).toEqual([
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6,
      1.7, 10, 100, 1000, 10000, 100000,
    ])
  })
})
