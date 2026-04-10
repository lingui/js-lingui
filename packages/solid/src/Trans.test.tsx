import { setupI18n } from "@lingui/core"
import { mockConsole } from "@lingui/test-utils"
import { fireEvent, render } from "@solidjs/testing-library"
import { createSignal, type JSXElement } from "solid-js"
import {
  I18nProvider,
  Trans,
  type TransRenderCallbackOrComponent,
  type TransRenderProps,
} from "./index"
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
        ID: "Translation",
      },
    },
  })

  const renderWithI18n = (renderNode: () => JSXElement) =>
    render(() => <I18nProvider i18n={i18n}>{renderNode()}</I18nProvider>)

  const text = (renderNode: () => JSXElement) =>
    renderWithI18n(renderNode).container.textContent
  const html = (renderNode: () => JSXElement) =>
    renderWithI18n(renderNode).container.innerHTML

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

    ;(
      [
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
          description:
            "`component` is not of type function, and return `defaultComponent`",
          props: {
            component: "invalid",
          },
          expectedLog:
            "Invalid value supplied to prop `component`. It must be a Solid component, provided invalid",
          expectedTextContent: "default_Some text",
        },
      ] as const
    ).forEach(({ description, expectedLog, props, expectedTextContent }) => {
      it(`when ${description}`, () => {
        mockConsole((console) => {
          const { container } = render(() => (
            <I18nProvider
              i18n={i18n}
              defaultComponent={({ translation }) => {
                return <>default_{translation}</>
              }}
            >
              <Trans
                {...(props as unknown as TransRenderCallbackOrComponent)}
                id="Some text"
              />
            </I18nProvider>
          ))

          expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining(expectedLog),
          )
          expect(container.textContent).toBe(expectedTextContent)
        })
      })
    })

    it("when there's no i18n context available", () => {
      mockConsole(() => {
        expect(() => render(() => <Trans id="unknown" />))
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: Trans component was rendered without I18nProvider.
          Attempted to render message: undefined id: unknown. Make sure this component is rendered inside a I18nProvider.]
        `)
        expect(() =>
          render(() => <Trans id="unknown" message={"some valid message"} />),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: Trans component was rendered without I18nProvider.
          Attempted to render message: some valid message id: unknown. Make sure this component is rendered inside a I18nProvider.]
        `)
      })
    })
  })

  it("should follow jsx semantics regarding booleans", () => {
    expect(
      html(() => (
        <Trans
          id="unknown"
          message={"foo <0>{0}</0> bar"}
          values={{
            0: false,
          }}
          components={{
            0: (props) => <span>{props.children}</span>,
          }}
        />
      )),
    ).toEqual("foo <span></span> bar")

    expect(
      html(() => (
        <Trans
          id="unknown"
          message={"foo <0>{0}</0> bar"}
          values={{
            0: "lol",
          }}
          components={{
            0: (props) => <span>{props.children}</span>,
          }}
        />
      )),
    ).toEqual("foo <span>lol</span> bar")
  })

  it("should render null and boolean values with JSX semantics without warnings", () => {
    mockConsole((console) => {
      ;([null, false, true] as const).forEach((name) => {
        expect(
          html(() => (
            <Trans id="unknown" message={"foo {name} bar"} values={{ name }} />
          )),
        ).toEqual("foo  bar")
      })

      expect(console.warn).not.toBeCalled()
      expect(console.error).not.toBeCalled()
    })
  })

  it("should render default string", () => {
    expect(text(() => <Trans id="unknown" />)).toEqual("unknown")

    expect(
      text(() => <Trans id="unknown" message="Not translated yet" />),
    ).toEqual("Not translated yet")

    expect(
      text(() => (
        <Trans
          id="unknown"
          message="Not translated yet, {name}"
          values={{ name: "Dave" }}
        />
      )),
    ).toEqual("Not translated yet, Dave")
  })

  it("should render translation", () => {
    const translation = text(() => (
      <Trans id="All human beings are born free and equal in dignity and rights." />
    ))

    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.",
    )
  })

  it("should render translation from variable", () => {
    const msg =
      "All human beings are born free and equal in dignity and rights."
    const translation = text(() => <Trans id={msg} />)

    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.",
    )
  })

  it("should render component in variables", () => {
    const translation = html(() => (
      <Trans id="Hello {name}" values={{ name: <strong>John</strong> }} />
    ))

    expect(translation).toEqual("Hello <strong>John</strong>")
  })

  it("should render array of components in variables", () => {
    const translation = html(() => (
      <Trans
        id="Hello {name}"
        values={{
          name: [<strong>John</strong>, <strong>!</strong>],
        }}
      />
    ))

    expect(translation).toEqual("Hello <strong>John</strong><strong>!</strong>")
  })

  it("should render named component in components", () => {
    const translation = html(() => (
      <Trans
        id="Read <named>the docs</named>"
        components={{ named: (props) => <a href="/docs">{props.children}</a> }}
      />
    ))

    expect(translation).toEqual(`Read <a href="/docs">the docs</a>`)
  })

  it("should render nested named components in components", () => {
    const translation = html(() => (
      <Trans
        id="Read <link>the <strong>docs</strong></link>"
        components={{
          link: (props) => <a href="/docs">{props.children}</a>,
          strong: (props) => <strong>{props.children}</strong>,
        }}
      />
    ))

    expect(translation).toEqual(
      `Read <a href="/docs">the <strong>docs</strong></a>`,
    )
  })

  it("should preserve interactive behavior when components are provided as factories", async () => {
    const handleClick = vi.fn()
    const view = renderWithI18n(() => (
      <Trans
        id="Read <link>the docs</link>"
        components={{
          link: (props) => (
            <button type="button" onClick={handleClick}>
              {props.children}
            </button>
          ),
        }}
      />
    ))

    fireEvent.click(view.getByRole("button", { name: "the docs" }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("should render components and array components with variable", () => {
    const translation = html(() => (
      <Trans
        id="Read <link>the <strong>docs</strong></link>, {name}"
        components={{
          link: (props) => <a href="/docs">{props.children}</a>,
          strong: (props) => <strong>{props.children}</strong>,
        }}
        values={{
          name: [<strong>John</strong>, <strong>!</strong>],
        }}
      />
    ))

    expect(translation).toEqual(
      `Read <a href="/docs">the <strong>docs</strong></a>, <strong>John</strong><strong>!</strong>`,
    )
  })

  it("should render non-named component in components", () => {
    const translation = html(() => (
      <Trans
        id="Read <0>the docs</0>"
        components={{ 0: (props) => <a href="/docs">{props.children}</a> }}
      />
    ))

    expect(translation).toEqual(`Read <a href="/docs">the docs</a>`)
  })

  it("should render translation inside custom component", () => {
    const Component = (props: TransRenderProps) => (
      <p class="lead">{props.children}</p>
    )
    const html1 = html(() => <Trans component={Component} id="Original" />)
    const html2 = html(() => (
      <Trans
        render={({ translation }) => <p class="lead">{translation}</p>}
        id="Original"
      />
    ))

    expect(html1).toEqual('<p class="lead">Původní</p>')
    expect(html2).toEqual('<p class="lead">Původní</p>')
  })

  it("should render custom format", () => {
    const translation = text(() => (
      <Trans
        id="msg.currency"
        message="{value, number, currency}"
        values={{ value: 1 }}
        formats={{
          currency: {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
          },
        }}
      />
    ))

    expect(translation).toEqual("1,00 €")
  })

  it("should render plural", () => {
    const renderPlural = (count: number) =>
      html(() => (
        <Trans
          id={"tYX0sm"}
          message={
            "{count, plural, =0 {Zero items} one {# item} other {# <0>A lot of them</0>}}"
          }
          values={{ count }}
          components={{ 0: (props) => <a href="/more">{props.children}</a> }}
        />
      ))

    expect(renderPlural(0)).toEqual("Zero items")
    expect(renderPlural(1)).toEqual("1 item")
    expect(renderPlural(2)).toEqual(`2 <a href="/more">A lot of them</a>`)
  })

  describe("rendering", () => {
    it("should render a text node with no wrapper element", () => {
      expect(html(() => <Trans id="Some text" />)).toEqual("Some text")
    })

    it("should render custom element", () => {
      const element = html(() => (
        <Trans
          render={({ id, translation }) => <h1 id={id}>{translation}</h1>}
          id="Headline"
        />
      ))

      expect(element).toEqual(`<h1 id="Headline">Headline</h1>`)
    })

    it("supports render callback function", () => {
      const spy = vi.fn()

      text(() => (
        <Trans
          id="ID"
          message="Default"
          render={(props) => {
            spy(props)
            return <></>
          }}
        />
      ))

      expect(spy).toHaveBeenCalledWith({
        id: "ID",
        message: "Default",
        translation: "Translation",
        children: "Translation",
      })
    })

    it("should take defaultComponent prop with a custom component", () => {
      function ComponentFC(props: TransRenderProps) {
        return <div>{props.children}</div>
      }

      const markup = render(() => (
        <I18nProvider i18n={i18n} defaultComponent={ComponentFC}>
          <Trans id="Some text" />
        </I18nProvider>
      )).container.innerHTML

      expect(markup).toEqual(`<div>Some text</div>`)
    })
    ;([{ component: null }, { render: null }] as const).forEach((props) => {
      it("should ignore defaultComponent when `component` or `render` is null", () => {
        function ComponentFC(componentProps: TransRenderProps) {
          return <div>{componentProps.children}</div>
        }

        const translation = render(() => (
          <I18nProvider i18n={i18n} defaultComponent={ComponentFC}>
            <Trans id="Some text" {...props} />
          </I18nProvider>
        )).container.innerHTML

        expect(translation).toEqual("Some text")
      })
    })
  })

  describe("component prop rendering", () => {
    it("should render function component as simple prop", () => {
      const propsSpy = vi.fn()

      function ComponentFC(componentProps: TransRenderProps) {
        propsSpy(componentProps)
        const [value] = createSignal("value")
        return <div id={componentProps.id}>{value()}</div>
      }

      const element = html(() => (
        <Trans component={ComponentFC} id="Headline" />
      ))

      expect(element).toEqual(`<div id="Headline">value</div>`)
      expect(propsSpy).toHaveBeenCalledWith({
        id: "Headline",
        message: undefined,
        translation: "Headline",
        children: "Headline",
      })
    })
  })

  describe("I18nProvider defaultComponent accepts render-like props", () => {
    function DefaultComponent(props: TransRenderProps) {
      return (
        <>
          <div data-testid="children">{props.children}</div>
          {props.id && <div data-testid="id">{props.id}</div>}
          {props.message && <div data-testid="message">{props.message}</div>}
          {props.translation && (
            <div data-testid="translation">{props.translation}</div>
          )}
        </>
      )
    }

    it("should render defaultComponent with Trans props", () => {
      const markup = render(() => (
        <I18nProvider i18n={i18n} defaultComponent={DefaultComponent}>
          <Trans id="ID" message="Some message" />
        </I18nProvider>
      ))

      expect(markup.queryByTestId("id")?.innerHTML).toEqual("ID")
      expect(markup.queryByTestId("message")?.innerHTML).toEqual("Some message")
      expect(markup.queryByTestId("translation")?.innerHTML).toEqual(
        "Translation",
      )
    })

    describe("TransNoContext", () => {
      it("should render without provider/context", () => {
        const translation = render(() => (
          <TransNoContext
            id="All human beings are born free and equal in dignity and rights."
            lingui={{ i18n: () => i18n }}
          />
        )).container.textContent

        expect(translation).toEqual(
          "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.",
        )
      })
    })
  })
})
