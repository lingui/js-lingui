import { I18n, setupI18n } from "@lingui/core"
import { render } from "@solidjs/testing-library"
import type { JSX } from "solid-js"
import { createMemo } from "solid-js"
import { I18nProvider, useLingui } from "./I18nProvider"

describe("I18nProvider", () => {
  it(
    "should pass i18n context to wrapped components, " +
      "and update computations that consume the context through useLingui()",
    () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {},
          cs: {},
        },
      })
      let staticRenderCount = 0
      let dynamicRenderCount = 0

      const WithoutLinguiHook = (
        props: JSX.HTMLAttributes<HTMLDivElement> & { i18n: I18n },
      ) => {
        staticRenderCount++
        return <div {...props}>{props.i18n.locale}</div>
      }

      const WithLinguiHook = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
        const { i18n } = useLingui()
        const locale = createMemo(() => {
          dynamicRenderCount++
          return i18n().locale
        })

        return <div {...props}>{locale()}</div>
      }

      const { getByTestId } = render(() => (
        <I18nProvider i18n={i18n}>
          <WithoutLinguiHook i18n={i18n} data-testid="static" />
          <WithLinguiHook data-testid="dynamic" />
        </I18nProvider>
      ))

      i18n.activate("cs")

      expect(getByTestId("static").textContent).toEqual("en")
      expect(getByTestId("dynamic").textContent).toEqual("cs")

      i18n.activate("en")

      expect(getByTestId("static").textContent).toEqual("en")
      expect(getByTestId("dynamic").textContent).toEqual("en")
      expect(staticRenderCount).toEqual(1)
      expect(dynamicRenderCount).toEqual(3) // initial, cs, en
    },
  )

  it("should subscribe for locale changes upon mount", () => {
    const i18n = setupI18n({
      locale: "cs",
      messages: {
        cs: {},
      },
    })
    i18n.on = vi.fn(() => vi.fn())

    expect(i18n.on).not.toBeCalled()
    render(() => (
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    ))
    expect(i18n.on).toBeCalledWith("change", expect.any(Function))
  })

  it("should unsubscribe for locale changes on unmount", () => {
    const unsubscribe = vi.fn()
    const i18n = setupI18n({
      locale: "cs",
      messages: {
        cs: {},
      },
    })
    i18n.on = vi.fn(() => unsubscribe)

    const { unmount } = render(() => (
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    ))
    expect(unsubscribe).not.toBeCalled()
    unmount()
    expect(unsubscribe).toBeCalled()
  })

  it("I18nProvider renders `null` until locale is activated. Children are rendered after activation.", () => {
    expect.assertions(3)

    const i18n = setupI18n()

    const CurrentLocaleStatic = () => {
      return <span data-testid="static">1_{i18n.locale}</span>
    }
    const CurrentLocaleContextConsumer = () => {
      const { i18n } = useLingui()
      return <span data-testid="dynamic">2_{i18n().locale}</span>
    }

    const { container } = render(() => (
      <I18nProvider i18n={i18n}>
        <CurrentLocaleStatic />
        <CurrentLocaleContextConsumer />
      </I18nProvider>
    ))

    // First render — locale isn't activated
    expect(container.textContent).toEqual("")

    i18n.load("cs", {})
    // Catalog is loaded, but locale still isn't activated.
    expect(container.textContent).toEqual("")

    i18n.activate("cs")
    // After loading and activating locale, components are rendered for the first time
    expect(container.textContent).toEqual("1_cs2_cs")
  })

  it(
    "given 'en' locale, if activate('cs') call happens before i18n.on-change subscription in createEffect(), " +
      "I18nProvider detects that it's stale and updates with the 'cs' locale value",
    () => {
      const i18n = setupI18n({
        locale: "en",
        messages: { en: {} },
      })
      let renderCount = 0

      const CurrentLocaleContextConsumer = () => {
        const { i18n } = useLingui()
        const locale = createMemo(() => {
          renderCount++
          return i18n().locale
        })

        return <span data-testid="child">{locale()}</span>
      }

      /**
       * Note that we're doing exactly what the description says:
       * but to simulate the equivalent situation, we pass our own mock subscriber
       * to i18n.on("change", ...) and in it we call i18n.activate("cs") ourselves
       * so that the condition in createEffect() is met and dependent computations update
       * */
      const mockSubscriber = vi.fn(() => {
        i18n.load("cs", {})
        i18n.activate("cs")
        return () => {
          // unsubscriber - noop to make TS happy
        }
      })
      vi.spyOn(i18n, "on").mockImplementation(mockSubscriber)

      const { getByTestId } = render(() => (
        <I18nProvider i18n={i18n}>
          <CurrentLocaleContextConsumer />
        </I18nProvider>
      ))

      expect(mockSubscriber).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      )
      expect(getByTestId("child").textContent).toBe("cs")
      expect(renderCount).toBe(2)
    },
  )

  it("should render children", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: { en: {} },
    })

    const child = <div data-testid="child" />
    const { getByTestId } = render(() => (
      <I18nProvider i18n={i18n}>{child}</I18nProvider>
    ))
    expect(getByTestId("child")).toBeTruthy()
  })

  it("using the _ function from useLingui renders fresh translations even when memoized", () => {
    const greetingId = "greeting"
    const i18n = setupI18n({
      locale: "en",
      messages: {
        en: {
          [greetingId]: "Hello World",
        },
        cs: {
          [greetingId]: "Ahoj světe",
        },
      },
    })

    const ComponentWithMemo = () => {
      const { _ } = useLingui()
      const message = createMemo(() => _(greetingId))
      return <div>{message()}</div>
    }

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <ComponentWithMemo />
      </I18nProvider>
    ))

    expect(getByText("Hello World")).toBeTruthy()

    i18n.activate("cs")

    expect(getByText("Ahoj světe")).toBeTruthy()
  })

  it("keeps memoized useLingui().i18n() locale in sync on locale change", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: {
        en: {},
        cs: {},
      },
    })

    const ComponentWithMemoizedI18n = () => {
      const { i18n } = useLingui()
      const getLocale = (i18nInstance: I18n) => i18nInstance.locale
      const currentLocale = createMemo(() => getLocale(i18n()))

      return <div data-testid="locale">{currentLocale()}</div>
    }

    const { getByTestId } = render(() => (
      <I18nProvider i18n={i18n}>
        <ComponentWithMemoizedI18n />
      </I18nProvider>
    ))

    expect(getByTestId("locale").textContent).toBe("en")

    i18n.activate("cs")

    expect(getByTestId("locale").textContent).toBe("cs")
  })
})
