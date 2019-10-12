import mockFs from "mock-fs"
import { detect, projectType } from "./detect"

describe("detect", function() {
  afterEach(mockFs.restore)

  it("should detect create-react-app project", () => {
    mockFs({
      "package.json": JSON.stringify({
        dependencies: {
          "react-scripts": "2.0.0"
        }
      })
    })

    expect(detect()).toEqual(projectType.CRA)
  })

  it("should detect react project", () => {
    mockFs({
      "package.json": JSON.stringify({
        dependencies: {
          react: "16.4.1"
        }
      })
    })

    expect(detect()).toEqual(projectType.REACT)
  })
})
