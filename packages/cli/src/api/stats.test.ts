import mockFs from "mock-fs"
import { mockConfig } from "@lingui/jest-mocks"
import { printStats } from "./stats"
import { defaultMergeOptions, makeCatalog, makeNextMessage } from "../tests"

describe("PrintStats", () => {
  afterEach(() => {
    mockFs.restore()
  })

  it("should print correct stats for a basic setup", () => {
    const config = mockConfig({
      locales: ["en", "cs"],
    })

    const prevCatalogs = { en: null, cs: null }
    const nextCatalog = {
      "custom.id": makeNextMessage({
        message: "Message with custom ID",
      }),
      "Message with <0>auto-generated</0> ID": makeNextMessage(),
    }

    const catalogs = makeCatalog({ sourceLocale: "en" }).merge(
      prevCatalogs,
      nextCatalog,
      defaultMergeOptions
    )

    const { options, ...table } = printStats(config, catalogs)
    expect(options.head).toEqual(["Language", "Total count", "Missing"])
    expect(Object.values(table)).toStrictEqual([
      { en: [2, 0] },
      { cs: [2, 2] },
      2,
    ])
  })
})
