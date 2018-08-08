import mockFs from "mock-fs"
import { installPackages } from "./lingui-init"
import { mockConsole } from "./mocks"
import inquirer from "inquirer"

describe("lingui init", function() {
  let inquirerPrompt

  beforeAll(() => {
    inquirerPrompt = inquirer.prompt
    inquirer.prompt = jest.fn()
  })

  afterAll(() => {
    inquirer.prompt = inquirerPrompt
  })

  afterEach(() => {
    mockFs.restore()
    inquirer.prompt.mockReset()
  })

  describe("install packages", function() {
    beforeEach(() => {
      inquirer.prompt = jest.fn(prompt =>
        Promise.resolve({ [prompt.name]: true })
      )
    })

    it("should use yarn when available", () => {
      mockFs({
        "yarn.lock": mockFs.file(),
        "package.json": JSON.stringify({
          dependencies: {}
        })
      })

      expect.assertions(3)
      return mockConsole(console =>
        installPackages(true).then(result => {
          expect(result).toBeTruthy()
          expect(console.log).toBeCalledWith("yarn add @lingui/core")
          expect(console.log).toBeCalledWith(
            "yarn add --dev @lingui/babel-preset-js"
          )
        })
      )
    })

    it("should use npm when yarn isn't available", () => {
      mockFs({
        "package.json": JSON.stringify({
          dependencies: {}
        })
      })

      expect.assertions(3)
      return mockConsole(console =>
        installPackages(true)
          .then(result => {
            expect(result).toBeTruthy()
            expect(console.log).toBeCalledWith(
              "npm install --save @lingui/core"
            )
            expect(console.log).toBeCalledWith(
              "npm install --save-dev @lingui/babel-preset-js"
            )
          })
          .catch(error => console.log({ error }))
      )
    })

    it("should detect create-react-app project", () => {
      mockFs({
        "package.json": JSON.stringify({
          dependencies: {
            "react-scripts": "2.0.0"
          }
        })
      })

      expect.assertions(3)
      return mockConsole(console =>
        installPackages(true)
          .then(result => {
            expect(result).toBeTruthy()
            expect(console.log).toBeCalledWith(
              "npm install --save @lingui/react"
            )
            expect(console.log).toBeCalledWith(
              "npm install --save-dev @lingui/babel-preset-react"
            )
          })
          .catch(error => console.log({ error }))
      )
    })

    it("should install core only for other projects", () => {
      mockFs({
        "package.json": JSON.stringify({
          dependencies: {}
        })
      })

      expect.assertions(3)
      return mockConsole(console =>
        installPackages(true)
          .then(result => {
            expect(result).toBeTruthy()
            expect(console.log).toBeCalledWith(
              "npm install --save @lingui/core"
            )
            expect(console.log).toBeCalledWith(
              "npm install --save-dev @lingui/babel-preset-js"
            )
          })
          .catch(error => console.log({ error }))
      )
    })
  })
})
