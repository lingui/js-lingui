import fs from "fs"
import { mockConsole, mockConfig } from "@lingui/jest-mocks"
import command from "./lingui-extract"
import configureCatalog from "./api/catalog"
import { detect } from "./api/detect"

import { extract, collect, cleanObsolete, order } from "./api/catalog"

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

    configureCatalog.mockImplementation(() => {
      return {
        getLocales: jest.fn().mockReturnValue([])
      }
    })

    mockConsole(console => {
      command(config, options)
      expect(console.log).toBeCalledWith(
        expect.stringContaining("No locales defined")
      )
    })
  })
})
