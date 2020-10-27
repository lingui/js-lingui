import { fromHtmlTag } from "..";
import { JSDOM } from "jsdom"

describe('htmlTag detector', () => {
  it('should find a locale from a standard html5', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html lang="es"<p>Hello world</p></html>`);
    expect(fromHtmlTag("lang", dom.window.document)).toEqual('es')
  })

  it('should find a locale from a xml lang attribute', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html xml:lang="en"<p>Hello world</p></html>`);
    expect(fromHtmlTag("xml:lang", dom.window.document)).toEqual('en')
  })
})