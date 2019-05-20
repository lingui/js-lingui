import * as React from "react"
import { render } from "react-testing-library"
import { Trans, I18nProvider } from "@lingui/react"
import { setupI18n } from "@lingui/core"

describe("Trans component", function() {
  /*
   * Setup context, define helpers
   */
  const i18n = setupI18n({
    locale: "cs",
    catalogs: {
      cs: {
        messages: {
          "All human beings are born free and equal in dignity and rights.":
            "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.",
          "My name is {name}": "Jmenuji se {name}",
          Original: "Původní",
          Updated: "Aktualizovaný",
          "msg.currency": "{value, number, currency}",
          ID: "Translation"
        }
      }
    }
  })

  const renderWithI18n = node =>
    render(<I18nProvider i18n={i18n}>{node}</I18nProvider>)
  const text = node => renderWithI18n(node).container.textContent
  const html = node => renderWithI18n(node).container.innerHTML

  /*
   * Tests
   */

  it("should throw error without i18n context", function() {
    const originalConsole = console.error
    console.error = jest.fn()

    expect(() => render(<Trans id="unknown" />)).toThrow()

    console.error = originalConsole
  })

  it("should render default string", function() {
    expect(text(<Trans id="unknown" />)).toEqual("unknown")

    expect(text(<Trans id="unknown" message="Not translated yet" />)).toEqual(
      "Not translated yet"
    )

    expect(
      text(
        <Trans
          id="unknown"
          message="Not translated yet, {name}"
          values={{ name: "Dave" }}
        />
      )
    ).toEqual("Not translated yet, Dave")
  })

  it("should render translation", function() {
    const translation = text(
      <Trans id="All human beings are born free and equal in dignity and rights." />
    )

    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
    )
  })

  it("should render translation from variable", function() {
    const msg =
      "All human beings are born free and equal in dignity and rights."
    const translation = text(<Trans id={msg} />)
    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
    )
  })

  it("should render component in variables", function() {
    const translation = html(
      <Trans id="Hello {name}" values={{ name: <strong>John</strong> }} />
    )
    expect(translation).toEqual("Hello <strong>John</strong>")
  })

  it("should render translation inside custom component", function() {
    const html1 = html(<Trans render={<p className="lead" />} id="Original" />)
    const html2 = html(
      <Trans
        render={({ translation }) => <p className="lead">{translation}</p>}
        id="Original"
      />
    )

    expect(html1).toEqual('<p class="lead">Původní</p>')
    expect(html2).toEqual(html1)
  })

  it("should render custom format", function() {
    const translation = text(
      <Trans
        id="msg.currency"
        values={{ value: 1 }}
        formats={{
          currency: {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2
          }
        }}
      />
    )
    expect(translation).toEqual("1,00 €")
  })

  describe("rendering", function() {
    it("should render just a text without wrapping element", function() {
      const txt = html(<Trans id="Just a text" />)
      expect(txt).toEqual("Just a text")
    })

    it("should render with built-in element", function() {
      const span = html(<Trans render="span" id="Just a text" />)
      expect(span).toEqual("<span>Just a text</span>")
    })

    it("should render custom element", function() {
      const element = html(<Trans render={<h1 />} id="Headline" />)
      expect(element).toEqual("<h1>Headline</h1>")
    })

    it("should render function", function() {
      const spy = jest.fn()
      text(
        <Trans
          id="ID"
          message="Default"
          render={props => {
            spy(props)
            return null
          }}
        />
      )

      expect(spy).toHaveBeenCalledWith({
        id: "ID",
        message: "Default",
        translation: "Translation"
      })
    })

    it("should take default render element", function() {
      const span = render(
        <I18nProvider i18n={i18n} defaultRender="p">
          <Trans id="Just a text" />
        </I18nProvider>
      ).container.innerHTML
      expect(span).toEqual("<p>Just a text</p>")
    })
  })
})
