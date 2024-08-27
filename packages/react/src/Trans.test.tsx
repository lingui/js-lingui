import * as React from "react"
import { render } from "@testing-library/react"
import {
  Trans,
  I18nProvider,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "@lingui/react"
import { setupI18n } from "@lingui/core"
import { mockConsole } from "@lingui/jest-mocks"
import { PropsWithChildren } from "react"
import { TransNoContext } from "./TransNoContext"

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

  const renderWithI18n = (node: React.ReactNode) =>
    render(<I18nProvider i18n={i18n}>{node}</I18nProvider>)
  const text = (node: React.ReactNode) =>
    renderWithI18n(node).container.textContent
  const html = (node: React.ReactNode) =>
    renderWithI18n(node).container.innerHTML

  /*
   * Tests
   */

  describe("should log console.error", () => {
    const renderProp = ({ children }: TransRenderProps) => (
      <span>render_{children}</span>
    )
    const component = ({ children }: TransRenderProps) => (
      <span>component_{children}</span>
    )
    test.each<{
      description: string
      props: any
      expectedLog: string
      expectedTextContent: string
    }>([
      {
        description:
          "both `render` and `component` are used, and return `render`",
        props: {
          render: renderProp,
          component,
        },
        expectedLog:
          "You can't use both `component` and `render` prop at the same time.",
        expectedTextContent: "render_Some text",
      },
      {
        description:
          "`render` is not of type function, and return `defaultComponent`",
        props: {
          render: "invalid",
        },
        expectedLog:
          "Invalid value supplied to prop `render`. It must be a function, provided invalid",
        expectedTextContent: "default_Some text",
      },
      {
        description: "`component` is not of type function, and return ",
        props: {
          component: "invalid",
        },
        expectedLog:
          "Invalid value supplied to prop `component`. It must be a React component, provided invalid",
        expectedTextContent: "default_Some text",
      },
    ])("when $description", ({ expectedLog, props, expectedTextContent }) => {
      mockConsole((console) => {
        const { container } = render(
          <I18nProvider
            i18n={i18n}
            defaultComponent={({ translation }) => {
              return <>default_{translation}</>
            }}
          >
            <Trans {...props} id="Some text" />
          </I18nProvider>
        )

        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining(expectedLog)
        )
        expect(container.textContent).toBe(expectedTextContent)
      })
    })

    it("when there's no i18n context available", () => {
      const originalConsole = console.error
      console.error = jest.fn()

      expect(() => render(<Trans id="unknown" />))
        .toThrowErrorMatchingInlineSnapshot(`
        "Trans component was rendered without I18nProvider.
        Attempted to render message: undefined id: unknown. Make sure this component is rendered inside a I18nProvider."
      `)
      expect(() =>
        render(<Trans id="unknown" message={"some valid message"} />)
      ).toThrowErrorMatchingInlineSnapshot(`
        "Trans component was rendered without I18nProvider.
        Attempted to render message: some valid message id: unknown. Make sure this component is rendered inside a I18nProvider."
      `)

      console.error = originalConsole
    })

    it("when deprecated string built-ins are used", () => {
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

  it("should render array of components in variables", () => {
    const translation = html(
      <Trans
        id="Hello {name}"
        values={{
          name: [<strong key="1">John</strong>, <strong key="2">!</strong>],
        }}
      />
    )
    expect(translation).toEqual("Hello <strong>John</strong><strong>!</strong>")
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

  it("should render components and array components with variable", () => {
    const translation = html(
      <Trans
        id="Read <link>the <strong>docs</strong></link>, {name}"
        components={{ link: <a href="/docs" />, strong: <strong /> }}
        values={{
          name: [<strong key="1">John</strong>, <strong key="2">!</strong>],
        }}
      />
    )
    expect(translation).toEqual(
      `Read <a href="/docs">the <strong>docs</strong></a>, <strong>John</strong><strong>!</strong>`
    )
  })

  it("should render non-named component in components", () => {
    const translation = html(
      <Trans id="Read <0>the docs</0>" components={{ 0: <a href="/docs" /> }} />
    )
    expect(translation).toEqual(`Read <a href="/docs">the docs</a>`)
  })

  it('should render nested elements with `asChild` pattern', () => {
    const ComponentThatExpectsSingleElementChild: React.FC<{ asChild: boolean, children?: React.ReactElement }> = (
      props
    ) => {
      if (props.asChild && React.isValidElement(props.children)) {
        return props.children
      }

      return <div />
    }

    const translation = html(
      <Trans id="please <0><1>sign in again</1></0>" components={{
        0: <ComponentThatExpectsSingleElementChild asChild />,
        1: <a href="/login" />
      }} />
    )
    expect(translation).toEqual(`please <a href="/login">sign in again</a>`)
  })

  it("should render translation inside custom component", () => {
    const Component = (props: PropsWithChildren) => (
      <p className="lead">{props.children}</p>
    )
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
            return <></>
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

    test.each<TransRenderCallbackOrComponent>([
      { component: null },
      { render: null },
    ])(
      "should ignore defaultComponent when `component` or `render` is null",
      (props) => {
        const ComponentFC: React.FunctionComponent<TransRenderProps> = (
          props
        ) => {
          return <div>{props.children}</div>
        }
        const translation = render(
          <I18nProvider i18n={i18n} defaultComponent={ComponentFC}>
            <Trans id="Some text" {...props} />
          </I18nProvider>
        ).container.innerHTML
        expect(translation).toEqual("Some text")
      }
    )
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

      expect(markup.queryByTestId("id")?.innerHTML).toEqual("ID")
      expect(markup.queryByTestId("message")?.innerHTML).toEqual("Some message")
      expect(markup.queryByTestId("translation")?.innerHTML).toEqual(
        "Translation"
      )
      expect(markup.queryByTestId("is-translated")?.innerHTML).toEqual("true")
    })

    it("should pass isTranslated: false if no translation", () => {
      const markup = render(
        <I18nProvider i18n={i18n} defaultComponent={DefaultComponent}>
          <Trans id="NO_ID" message="Some message" />
        </I18nProvider>
      )

      expect(markup.queryByTestId("id")?.innerHTML).toEqual("NO_ID")
      expect(markup.queryByTestId("translation")?.innerHTML).toEqual(
        "Some message"
      )
      expect(markup.queryByTestId("is-translated")?.innerHTML).toEqual("false")
    })

    describe("TransNoContext", () => {
      it("Should render without provider/context", () => {
        const translation = render(
          <TransNoContext
            id="All human beings are born free and equal in dignity and rights."
            lingui={{ i18n: i18n }}
          />
        ).container.textContent

        expect(translation).toEqual(
          "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
        )
      })
    })
  })
})
