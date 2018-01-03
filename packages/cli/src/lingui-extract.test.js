import { mockConsole } from "./mocks"
import command from "./lingui-extract"

describe("lingui extract", function() {
  beforeEach(() => {
    jest.resetModules()
  })

  it("should exit when there aren't any locales", function() {
    const config = {}
    const format = {
      getLocales: () => []
    }

    mockConsole(console => {
      command(config, format)
      expect(console.log).toBeCalledWith(
        expect.stringContaining("No locales defined")
      )
      expect(console.log).toBeCalledWith(
        expect.stringContaining("lingui add-locale")
      )
    })
  })
})
