// @flow
import { mockConsole, mockConfig } from "./mocks"
import command from "./lingui-extract"

describe("lingui extract", function() {
  function mockExtractOptions(options?: Object = {}) {
    return {
      verbose: false,
      clean: false,
      overwrite: false,
      babelOptions: {},
      ...options
    }
  }
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
})
