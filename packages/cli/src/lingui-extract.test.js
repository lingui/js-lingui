import fs from "fs"
import { mockConsole, mockConfig } from "./mocks"
import command from "./lingui-extract"
import configureCatalog from "./api/catalog"
import { detect } from "./api/detect"

import { extract, collect, cleanObsolete, order } from "./api/extract"

jest.mock("fs")
jest.mock("./api/catalog")
jest.mock("./api/extract")
jest.mock("./api/detect")

describe("lingui extract", function() {
  function mockExtractOptions(options) {
    return {
      verbose: false,
      clean: false,
      overwrite: false,
      babelOptions: {},
      ...options
    }
  }

  beforeEach(() => {
    detect.mockClear()
    extract.mockClear()
    collect.mockClear()
    cleanObsolete.mockClear()
    order.mockClear()
  })

  it("should exit when there aren't any locales", function() {
    const config = mockConfig()
    const options = mockExtractOptions()

    mockConsole(console => {
      command(config, options)
      expect(console.log).toBeCalledWith(
        expect.stringContaining("No locales defined")
      )
      expect(console.log).toBeCalledWith(
        expect.stringContaining("lingui add-locale")
      )
    })
  })
  it.only("should add pseudoLocale when defined", () => {
    const config = mockConfig({
      pseudoLocale: "pseudo-LOCALE"
    })
    const options = mockExtractOptions()

    const addLocale = jest.fn()
    const getLocales = jest.fn().mockReturnValue(["pseudo-LOCALE"])
    order.mockImplementation(() => ["pseudo-LOCALE"])
    configureCatalog.mockImplementation(() => {
      return {
        addLocale: addLocale,
        getLocales: getLocales,
        readAll: jest.fn(),
        merge: jest.fn(),
        write: jest.fn().mockReturnValue([true, "messages.json"])
      }
    })

    mockConsole(console => {
      command(config, options)
    })

    expect(addLocale).toBeCalledWith("pseudo-LOCALE")
  })
})
