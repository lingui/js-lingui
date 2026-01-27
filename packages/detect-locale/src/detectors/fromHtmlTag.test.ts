import { fromHtmlTag } from ".."
import { Browser } from "happy-dom"

describe("htmlTag detector", () => {
  it("should find a locale from a standard html5", () => {
    const browser = new Browser()
    const page = browser.newPage()

    page.content = '<html lang="es"><body><p>Hello world</p></body></html>'
    expect(
      fromHtmlTag("lang", page.mainFrame.document as unknown as Document),
    ).toEqual("es")
  })

  it("should find a locale from a xml lang attribute", () => {
    const browser = new Browser()
    const page = browser.newPage()

    page.content = `<html xml:lang="en"><p>Hello world</p></html>`
    expect(
      fromHtmlTag("xml:lang", page.mainFrame.document as unknown as Document),
    ).toEqual("en")
  })
})
