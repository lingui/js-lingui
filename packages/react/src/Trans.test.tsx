import * as React from "react"
import { render } from "@testing-library/react"
import { Trans, I18nProvider } from "@lingui/react"
import { setupI18n } from "@lingui/core"

describe("Trans component", function () {
  /*
   * Setup context, define helpers
   */
  const i18n = setupI18n({
    locale: "cs",
    messages: {
      cs: {
        "All human beings are born free and equal in dignity and rights.":
          "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.",
        "My name is {name}": "Jmenuji se {name}",
        Original: "Původní",
        Updated: "Aktualizovaný",
        "msg.currency": "{value, number, currency}",
        ID: "Translation",
      },
    },
  })

  const renderWithI18n = (node) =>
    render(<I18nProvider i18n={i18n}>{node}</I18nProvider>)
  const text = (node) => renderWithI18n(node).container.textContent
  const html = (node) => renderWithI18n(node).container.innerHTML

  /*
   * Tests
   */

  it("should throw error without i18n context", function () {
    const originalConsole = console.error
    console.error = jest.fn()

    expect(() => render(<Trans id="unknown" />)).toThrow()

    console.error = originalConsole
  })

  it("should throw a console.error about deprecated usage of string built-in", function () {
    const originalConsole = console.error
    console.error = jest.fn()

    // @ts-expect-error testing the error
    renderWithI18n(<Trans render="span" id="Some text" />)
    expect(console.error).toHaveBeenCalled()

    // @ts-expect-error testing the error
    renderWithI18n(<Trans render="span" id="Some text" />)
    expect(console.error).toHaveBeenCalledTimes(2)
    console.error = originalConsole
  })

  it("should throw a console.error if using twice props", function () {
    const originalConsole = console.error
    console.error = jest.fn()

    // @ts-expect-error testing the error
    renderWithI18n(<Trans render="div" component="span" id="Some text" />)
    expect(console.error).toHaveBeenCalled()
    console.error = originalConsole
  })

  it("should render default string", function () {
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

  it("should render translation", function () {
    const translation = text(
      <Trans id="All human beings are born free and equal in dignity and rights." />
    )

    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
    )
  })

  it("should render translation from variable", function () {
    const msg =
      "All human beings are born free and equal in dignity and rights."
    const translation = text(<Trans id={msg} />)
    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
    )
  })

  it("should render component in variables", function () {
    const translation = html(
      <Trans id="Hello {name}" values={{ name: <strong>John</strong> }} />
    )
    expect(translation).toEqual("Hello <strong>John</strong>")
  })

  it("should render translation inside custom component", function () {
    const Component = (props) => <p className="lead">{props.children}</p>
    const html1 = html(<Trans component={Component} id="Original" />)
    const html2 = html(
      <Trans
        render={({ translation }) => <p className="lead">{translation}</p>}
        id="Original"
      />
    )

    expect(html1).toEqual('<p class="lead">Původní</p>')
    expect(html2).toEqual('<p class="lead">Původní</p>')
  })

  it("should render custom format", function () {
    const translation = text(
      <Trans
        id="msg.currency"
        values={{ value: 1 }}
        formats={{
          currency: {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
          },
        }}
      />
    )
    expect(translation).toEqual("1,00 €")
  })

  describe("rendering", function () {
    it("should render a text node with no wrapper element", function () {
      const txt = html(<Trans id="Some text" />)
      expect(txt).toEqual("Some text")
    })

    it("should render custom element", function () {
      const element = html(
        <Trans
          render={({ id, translation }) => <h1 id={id}>{translation}</h1>}
          id="Headline"
        />
      )
      expect(element).toEqual(`<h1 id="Headline">Headline</h1>`)
    })

    it("should render function", function () {
      const spy = jest.fn()
      text(
        <Trans
          id="ID"
          message="Default"
          render={(props) => {
            spy(props)
            return null
          }}
        />
      )

      expect(spy).toHaveBeenCalledWith({
        id: "ID",
        message: "Default",
        translation: "Translation",
      })
    })

    it("should take defaultComponent prop with a custom component", function () {
      const ComponentFC: React.FunctionComponent = (props: {
        children?: React.ReactNode
      }) => {
        return <div>{props.children}</div>
      }
      const span = render(
        <I18nProvider i18n={i18n} defaultComponent={ComponentFC}>
          <Trans id="Some text" />
        </I18nProvider>
      ).container.innerHTML
      expect(span).toEqual(`<div>Some text</div>`)
    })

    it("should ignore defaultComponent when render is null", function () {
      const ComponentFC: React.FunctionComponent = (props: {
        children?: React.ReactNode
      }) => {
        return <div>{props.children}</div>
      }
      const translation = render(
        <I18nProvider i18n={i18n} defaultComponent={ComponentFC}>
          <Trans id="Some text" render={null} />
        </I18nProvider>
      ).container.innerHTML
      expect(translation).toEqual("Some text")
    })

    it("should ignore defaultComponent when component is null", function () {
      const ComponentFC: React.FunctionComponent = (props: {
        children?: React.ReactNode
      }) => {
        return <div>{props.children}</div>
      }
      const translation = render(
        <I18nProvider i18n={i18n} defaultComponent={ComponentFC}>
          <Trans id="Some text" component={null} />
        </I18nProvider>
      ).container.innerHTML
      expect(translation).toEqual("Some text")
    })
  })

  describe("component prop rendering", function () {
    it("should render class component as simple prop", function () {
      class ClassComponent extends React.Component {
        render() {
          return <div>Headline</div>
        }
      }
      const element = html(<Trans component={ClassComponent} id="Headline" />)
      expect(element).toEqual("<div>Headline</div>")
    })

    it("should render functional component as simple prop", function () {
      const ComponentFC: React.FunctionComponent = (props: {
        id: any
        children?: React.ReactNode
      }) => {
        const [state] = React.useState("value")
        return <div id={props.id}>{state}</div>
      }
      const element = html(<Trans component={ComponentFC} id="Headline" />)
      expect(element).toEqual(`<div>value</div>`)
    })
  })
})
