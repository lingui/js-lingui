import { setupI18n } from "@lingui/core"
import { mockConsole } from "@lingui/test-utils"
import { mount } from "@vue/test-utils"
import { defineComponent, h, ref, type VNodeChild } from "vue"
import {
  I18nProvider,
  Trans,
  type I18nDefaultComponent,
  type TransRenderCallbackOrComponent,
  type TransRenderProps,
} from "./index"
import { TransNoContext } from "./TransNoContext"

/**
 * Functional components receive `id`, `message` and `translation` as props
 * only when they declare them, otherwise they fall through as attributes.
 */
const fc = (render: (props: TransRenderProps) => VNodeChild) =>
  Object.assign(render, { props: ["id", "message", "translation"] })

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

  const renderWithI18n = (
    renderNode: () => VNodeChild,
    defaultComponent?: I18nDefaultComponent,
  ) =>
    mount({
      render: () =>
        h("div", null, [
          h(I18nProvider, { i18n, defaultComponent }, { default: renderNode }),
        ]),
    })

  const text = (renderNode: () => VNodeChild) =>
    renderWithI18n(renderNode).element.textContent
  const html = (renderNode: () => VNodeChild) =>
    renderWithI18n(renderNode).element.innerHTML

  /*
   * Tests
   */

  describe("should log console.error", () => {
    const renderProp = fc(({ translation }) => (
      <span>render_{translation}</span>
    ))
    const component = fc(({ translation }) => (
      <span>component_{translation}</span>
    ))

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
            "`component` is not a component, and return `defaultComponent`",
          props: {
            component: 42,
          },
          expectedLog:
            "Invalid value supplied to prop `component`. It must be a Vue component, provided 42",
          expectedTextContent: "default_Some text",
        },
      ] as const
    ).forEach(({ description, expectedLog, props, expectedTextContent }) => {
      it(`when ${description}`, () => {
        mockConsole((console) => {
          const wrapper = renderWithI18n(
            () => (
              <Trans
                {...(props as unknown as TransRenderCallbackOrComponent)}
                id="Some text"
              />
            ),
            fc(({ translation }) => <>default_{translation}</>),
          )

          expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining(expectedLog),
          )
          expect(wrapper.element.textContent).toBe(expectedTextContent)
        })
      })
    })

    it("when there's no i18n context available", () => {
      mockConsole(() => {
        expect(() => mount(() => <Trans id="unknown" />))
          .toThrowErrorMatchingInlineSnapshot(`
            [Error: Trans component was rendered without I18nProvider. Attempted to render message: undefined id: unknown. Make sure this component is rendered inside a I18nProvider.

            This often happens when multiple instances of @lingui/vue are installed (e.g. due to a version mismatch or misconfiguration in a monorepo). Verify you have only one version installed by running: npm ls @lingui/vue (or pnpm why @lingui/vue / yarn why @lingui/vue).]
          `)
        expect(() =>
          mount(() => <Trans id="unknown" message={"some valid message"} />),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: Trans component was rendered without I18nProvider. Attempted to render message: some valid message id: unknown. Make sure this component is rendered inside a I18nProvider.

          This often happens when multiple instances of @lingui/vue are installed (e.g. due to a version mismatch or misconfiguration in a monorepo). Verify you have only one version installed by running: npm ls @lingui/vue (or pnpm why @lingui/vue / yarn why @lingui/vue).]
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
            0: <span />,
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
            0: <span />,
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
        components={{ named: <a href="/docs" /> }}
      />
    ))

    expect(translation).toEqual(`Read <a href="/docs">the docs</a>`)
  })

  it("should render nested named components in components", () => {
    const translation = html(() => (
      <Trans
        id="Read <link>the <strong>docs</strong></link>"
        components={{
          link: <a href="/docs" />,
          strong: <strong />,
        }}
      />
    ))

    expect(translation).toEqual(
      `Read <a href="/docs">the <strong>docs</strong></a>`,
    )
  })

  it("should render named slots as components", () => {
    const translation = html(() => (
      <Trans
        id="Read <0>the <1>docs</1></0>"
        v-slots={{
          0: () => <a href="/docs" />,
          1: () => <strong />,
        }}
      />
    ))

    expect(translation).toEqual(
      `Read <a href="/docs">the <strong>docs</strong></a>`,
    )
  })

  it("should preserve interactive behavior of components", async () => {
    const handleClick = vi.fn()
    const wrapper = renderWithI18n(() => (
      <Trans
        id="Read <link>the docs</link>"
        components={{
          link: <button type="button" onClick={handleClick} />,
        }}
      />
    ))

    await wrapper.find("button").trigger("click")

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("should render components and array components with variable", () => {
    const translation = html(() => (
      <Trans
        id="Read <link>the <strong>docs</strong></link>, {name}"
        components={{
          link: <a href="/docs" />,
          strong: <strong />,
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
      <Trans id="Read <0>the docs</0>" components={{ 0: <a href="/docs" /> }} />
    ))

    expect(translation).toEqual(`Read <a href="/docs">the docs</a>`)
  })

  it("should render translation inside custom component", () => {
    const Component = fc((props) => <p class="lead">{props.translation}</p>)
    const html1 = html(() => <Trans component={Component} id="Original" />)
    const html2 = html(() => (
      <Trans
        render={({ translation }) => <p class="lead">{translation}</p>}
        id="Original"
      />
    ))
    const html3 = html(() => <Trans component="p" id="Original" />)

    expect(html1).toEqual('<p class="lead">Původní</p>')
    expect(html2).toEqual('<p class="lead">Původní</p>')
    expect(html3).toEqual("<p>Původní</p>")
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
          components={{ 0: <a href="/more" /> }}
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
      })
    })

    it("should take defaultComponent prop with a custom component", () => {
      const ComponentFC = fc((props) => <div>{props.translation}</div>)

      const markup = renderWithI18n(() => <Trans id="Some text" />, ComponentFC)
        .element.innerHTML

      expect(markup).toEqual(`<div>Some text</div>`)
    })

    it("should pass the translation as the default slot of custom components", () => {
      const ComponentFC = defineComponent({
        props: ["id", "message", "translation"],
        setup(_props, { slots }) {
          return () => <div>{slots.default?.()}</div>
        },
      })

      const markup = renderWithI18n(() => <Trans id="Some text" />, ComponentFC)
        .element.innerHTML

      expect(markup).toEqual(`<div>Some text</div>`)
    })
    ;([{ component: null }, { render: null }] as const).forEach((props) => {
      it("should ignore defaultComponent when `component` or `render` is null", () => {
        const ComponentFC = fc((componentProps) => (
          <div>{componentProps.translation}</div>
        ))

        const translation = renderWithI18n(
          () => <Trans id="Some text" {...props} />,
          ComponentFC,
        ).element.innerHTML

        expect(translation).toEqual("Some text")
      })
    })
  })

  describe("component prop rendering", () => {
    it("should render function component as simple prop", () => {
      const propsSpy = vi.fn()

      const ComponentFC = defineComponent({
        props: ["id", "message", "translation"],
        setup(componentProps) {
          propsSpy({ ...componentProps })
          const value = ref("value")
          return () => <div id={componentProps.id}>{value.value}</div>
        },
      })

      const element = html(() => (
        <Trans component={ComponentFC} id="Headline" />
      ))

      expect(element).toEqual(`<div id="Headline">value</div>`)
      expect(propsSpy).toHaveBeenCalledWith({
        id: "Headline",
        message: undefined,
        translation: "Headline",
      })
    })
  })

  describe("I18nProvider defaultComponent accepts render-like props", () => {
    const DefaultComponent = fc((props) => (
      <>
        <div data-testid="children">{props.translation}</div>
        {props.id && <div data-testid="id">{props.id}</div>}
        {props.message && <div data-testid="message">{props.message}</div>}
        {props.translation && (
          <div data-testid="translation">{props.translation}</div>
        )}
      </>
    ))

    it("should render defaultComponent with Trans props", () => {
      const wrapper = renderWithI18n(
        () => <Trans id="ID" message="Some message" />,
        DefaultComponent,
      )

      expect(wrapper.find('[data-testid="id"]').text()).toEqual("ID")
      expect(wrapper.find('[data-testid="message"]').text()).toEqual(
        "Some message",
      )
      expect(wrapper.find('[data-testid="translation"]').text()).toEqual(
        "Translation",
      )
    })

    describe("TransNoContext", () => {
      it("should render without provider/context", () => {
        const translation = mount(() => (
          <TransNoContext
            id="All human beings are born free and equal in dignity and rights."
            lingui={{ i18n }}
          />
        )).element.textContent

        expect(translation).toEqual(
          "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.",
        )
      })
    })
  })
})
