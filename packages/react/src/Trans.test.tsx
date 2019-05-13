import * as React from "react"
import { mount } from "enzyme"

import { setupI18n, Trans, I18nProvider } from "@lingui/react"

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

  const text = node =>
    mount(<I18nProvider i18n={i18n}>{node}</I18nProvider>).text()
  const html = node =>
    mount(<I18nProvider i18n={i18n}>{node}</I18nProvider>).html()

  /*
   * Tests
   */

  it("shouldn't throw runtime error without i18n context", function() {
    expect(mount(<Trans id="unknown" />).text()).toEqual("unknown")
  })

  it("should render default string", function() {
    expect(text(<Trans id="unknown" />)).toEqual("unknown")

    expect(text(<Trans id="unknown" defaults="Not translated yet" />)).toEqual(
      "Not translated yet"
    )

    expect(
      text(
        <Trans
          id="unknown"
          defaults="Not translated yet, {name}"
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
      <span>
        <Trans id="Hello {name}" values={{ name: <strong>John</strong> }} />
      </span>
    )
    expect(translation).toMatchSnapshot()
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
    // We must test snapshots of HTML output, because <Trans> component might be renamed
    // in integration test (e.g. Trans$$1).

    it("should render just a text without wrapping element", function() {
      // <Trans> component must be wrapped in <span> if we want to get HTML, otherwise
      // it's just text and enzyme throws an error.
      const txt = mount(
        <span>
          <Trans id="Just a text" />
        </span>
      ).html()
      expect(txt).toMatchSnapshot()
    })

    it("should render with built-in element", function() {
      const span = mount(<Trans render="span" id="Just a text" />).html()
      expect(span).toMatchSnapshot()
    })

    it("should render custom element", function() {
      const element = mount(<Trans render={<h1 />} id="Headline" />).html()
      expect(element).toMatchSnapshot()
    })

    it("should render function", function() {
      const spy = jest.fn()
      text(
        <Trans
          id="ID"
          defaults="Default"
          render={props => {
            spy(props)
            return null
          }}
        />
      )

      expect(spy).toHaveBeenCalledWith({
        id: "ID",
        defaults: "Default",
        translation: "Translation"
      })
    })

    it("should take default render element", function() {
      const span = mount(
        <I18nProvider i18n={i18n} defaultRender="span">
          <Trans id="Just a text" />
        </I18nProvider>
      ).html()
      expect(span).toMatchSnapshot()
    })
  })
})
