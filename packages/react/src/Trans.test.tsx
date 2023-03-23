import * as React from "react"
import { render } from "@testing-library/react"
import { Trans, I18nProvider, TransRenderProps } from "@lingui/react"
import { setupI18n } from "@lingui/core"

describe("Trans component", () => {
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

  it("should throw error without i18n context", () => {
    const originalConsole = console.error
    console.error = jest.fn()

    expect(() => render(<Trans id="unknown" />)).toThrow()

    console.error = originalConsole
  })

  it("should throw a console.error about deprecated usage of string built-in", () => {
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

  it("should log a console.error if using `render` and `component` props at the same time", () => {
    const RenderChildrenInSpan = ({ children }: TransRenderProps) => (
      <span>{children}</span>
    )

    const originalConsole = console.error
    console.error = jest.fn()

    renderWithI18n(
      // @ts-expect-error TS won't allow passing both `render` and `component` props
      <Trans
        render={RenderChildrenInSpan}
        component={RenderChildrenInSpan}
        id="Some text"
      />
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "You can't use both `component` and `render` prop at the same time."
      )
    )
    console.error = originalConsole
  })

  it("should render default string", () => {
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

  it("should render translation", () => {
    const translation = text(
      <Trans id="All human beings are born free and equal in dignity and rights." />
    )

    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
    )
  })

  it("should render translation from variable", () => {
    const msg =
      "All human beings are born free and equal in dignity and rights."
    const translation = text(<Trans id={msg} />)
    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
    )
  })

  it("should render component in variables", () => {
    const translation = html(
      <Trans id="Hello {name}" values={{ name: <strong>John</strong> }} />
    )
    expect(translation).toEqual("Hello <strong>John</strong>")
  })

  it("should render named component in components", () => {
    const translation = html(
      <Trans
        id="Read <named>the docs</named>"
        components={{ named: <a href="/docs" /> }}
      />
    )
    expect(translation).toEqual(`Read <a href="/docs">the docs</a>`)
  })

  it("should render nested named components in components", () => {
    const translation = html(
      <Trans
        id="Read <link>the <strong>docs</strong></link>"
        components={{ link: <a href="/docs" />, strong: <strong /> }}
      />
    )
    expect(translation).toEqual(
      `Read <a href="/docs">the <strong>docs</strong></a>`
    )
  })

  it("should render non-named component in components", () => {
    const translation = html(
      <Trans id="Read <0>the docs</0>" components={{ 0: <a href="/docs" /> }} />
    )
    expect(translation).toEqual(`Read <a href="/docs">the docs</a>`)
  })

  it("should render translation inside custom component", () => {
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

  it("should render custom format", () => {
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

  describe("rendering", () => {
    it("should render a text node with no wrapper element", () => {
      const txt = html(<Trans id="Some text" />)
      expect(txt).toEqual("Some text")
    })

    it("should render custom element", () => {
      const element = html(
        <Trans
          render={({ id, translation }) => <h1 id={id}>{translation}</h1>}
          id="Headline"
        />
      )
      expect(element).toEqual(`<h1 id="Headline">Headline</h1>`)
    })

    it("supports render callback function", () => {
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
        children: "Translation",
        isTranslated: true,
      })
    })

    it("should take defaultComponent prop with a custom component", () => {
      const ComponentFC: React.FunctionComponent<TransRenderProps> = (
        props
      ) => {
        return <div>{props.children}</div>
      }
      const span = render(
        <I18nProvider i18n={i18n} defaultComponent={ComponentFC}>
          <Trans id="Some text" />
        </I18nProvider>
      ).container.innerHTML
      expect(span).toEqual(`<div>Some text</div>`)
    })

    it("should ignore defaultComponent when render is null", () => {
      const ComponentFC: React.FunctionComponent<TransRenderProps> = (
        props
      ) => {
        return <div>{props.children}</div>
      }
      const translation = render(
        <I18nProvider i18n={i18n} defaultComponent={ComponentFC}>
          <Trans id="Some text" render={null} />
        </I18nProvider>
      ).container.innerHTML
      expect(translation).toEqual("Some text")
    })

    it("should ignore defaultComponent when component is null", () => {
      const ComponentFC: React.FunctionComponent<TransRenderProps> = (
        props
      ) => {
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

  describe("component prop rendering", () => {
    it("should render class component as simple prop", () => {
      class ClassComponent extends React.Component<TransRenderProps> {
        render() {
          return <div>Headline</div>
        }
      }
      const element = html(<Trans component={ClassComponent} id="Headline" />)
      expect(element).toEqual("<div>Headline</div>")
    })

    it("should render function component as simple prop", () => {
      const propsSpy = jest.fn()
      const ComponentFC: React.FunctionComponent<TransRenderProps> = (
        props
      ) => {
        propsSpy(props)
        const [state] = React.useState("value")
        return <div id={props.id}>{state}</div>
      }

      const element = html(<Trans component={ComponentFC} id="Headline" />)
      expect(element).toEqual(`<div id="Headline">value</div>`)
      expect(propsSpy).toHaveBeenCalledWith({
        id: "Headline",
        isTranslated: false,
        message: undefined,
        translation: "Headline",
        children: "Headline",
      })
    })
  })

  describe("I18nProvider defaultComponent accepts render-like props", () => {
    const DefaultComponent: React.FunctionComponent<TransRenderProps> = (
      props
    ) => (
      <>
        <div data-testid="children">{props.children}</div>
        {props.id && <div data-testid="id">{props.id}</div>}
        {props.message && <div data-testid="message">{props.message}</div>}
        {props.translation && (
          <div data-testid="translation">{props.translation}</div>
        )}

        <div data-testid="is-translated">{String(props.isTranslated)}</div>
      </>
    )

    it("should render defaultComponent with Trans props", () => {
      const markup = render(
        <I18nProvider i18n={i18n} defaultComponent={DefaultComponent}>
          <Trans id="ID" message="Some message" />
        </I18nProvider>
      )

      expect(markup.queryByTestId("id").innerHTML).toEqual("ID")
      expect(markup.queryByTestId("message").innerHTML).toEqual("Some message")
      expect(markup.queryByTestId("translation").innerHTML).toEqual(
        "Translation"
      )
      expect(markup.queryByTestId("is-translated").innerHTML).toEqual("true")
    })

    it("should pass isTranslated: false if no translation", () => {
      const markup = render(
        <I18nProvider i18n={i18n} defaultComponent={DefaultComponent}>
          <Trans id="NO_ID" message="Some message" />
        </I18nProvider>
      )

      expect(markup.queryByTestId("id").innerHTML).toEqual("NO_ID")
      expect(markup.queryByTestId("translation").innerHTML).toEqual(
        "Some message"
      )
      expect(markup.queryByTestId("is-translated").innerHTML).toEqual("false")
    })
  })
})
