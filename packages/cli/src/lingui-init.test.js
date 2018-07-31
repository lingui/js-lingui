import mockFs from "mock-fs"
import { command } from "./lingui-init"
import { mockConsole } from "./mocks"

describe("lingui init", function() {
  afterEach(mockFs.restore)

  it("should use yarn when available", () => {
    mockFs({
      "yarn.lock": mockFs.file(),
      "package.json": JSON.stringify({
        dependencies: {}
      })
    })

    mockConsole(console => {
      expect(command({ dryRun: true })).toBeTruthy()
      expect(console.log).toBeCalledWith("yarn add @lingui/core")
      expect(console.log).toBeCalledWith(
        "yarn add --dev @lingui/babel-preset-js"
      )
    })
  })

  it("should use npm when yarn isn't available", () => {
    mockFs({
      "package.json": JSON.stringify({
        dependencies: {}
      })
    })

    mockConsole(console => {
      expect(command({ dryRun: true })).toBeTruthy()
      expect(console.log).toBeCalledWith("npm install --save @lingui/core")
      expect(console.log).toBeCalledWith(
        "npm install --save-dev @lingui/babel-preset-js"
      )
    })
  })

  it("should detect create-react-app project", () => {
    mockFs({
      "package.json": JSON.stringify({
        dependencies: {
          "react-scripts": "2.0.0"
        }
      })
    })

    mockConsole(console => {
      expect(command({ dryRun: true })).toBeTruthy()
      expect(console.log).toBeCalledWith("npm install --save @lingui/react")
      expect(console.log).toBeCalledWith(
        "npm install --save-dev @lingui/babel-preset-react"
      )
    })
  })

  it("should install core only for other projects", () => {
    mockFs({
      "package.json": JSON.stringify({
        dependencies: {}
      })
    })

    mockConsole(console => {
      expect(command({ dryRun: true })).toBeTruthy()
      expect(console.log).toBeCalledWith("npm install --save @lingui/core")
      expect(console.log).toBeCalledWith(
        "npm install --save-dev @lingui/babel-preset-js"
      )
    })
  })
})
