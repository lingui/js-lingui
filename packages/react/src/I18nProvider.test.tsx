import * as React from "react"
import { act, render } from "@testing-library/react"

import { I18nProvider, useLingui } from "./I18nProvider"
import { I18n, setupI18n } from "@lingui/core"
import { useMemo } from "react"

describe("I18nProvider", () => {
  it(
    "should pass i18n context to wrapped components, " +
      "and re-render components that consume the context through useLingui()",
    () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {},
          cs: {},
        },
      })
      let staticRenderCount = 0,
        dynamicRenderCount = 0
      const WithoutLinguiHook = (
        props: React.HTMLAttributes<HTMLDivElement> & { i18n: I18n }
      ) => {
        staticRenderCount++
        return <div {...props}>{props.i18n.locale}</div>
      }

      const WithLinguiHook = (props: React.HTMLAttributes<HTMLDivElement>) => {
        const { i18n } = useLingui()
        dynamicRenderCount++
        return <div {...props}>{i18n.locale}</div>
      }

      const { getByTestId } = render(
        <I18nProvider i18n={i18n}>
          <WithoutLinguiHook i18n={i18n} data-testid="static" />
          <WithLinguiHook data-testid="dynamic" />
        </I18nProvider>
      )

      act(() => {
        i18n.activate("cs")
      })

      expect(getByTestId("static").textContent).toEqual("en")
      expect(getByTestId("dynamic").textContent).toEqual("cs")

      act(() => {
        i18n.activate("en")
      })

      expect(getByTestId("static").textContent).toEqual("en")
      expect(getByTestId("dynamic").textContent).toEqual("en")
      expect(staticRenderCount).toEqual(1)
      expect(dynamicRenderCount).toEqual(3) // initial, cs, en
    }
  )

  it("should subscribe for locale changes upon mount", () => {
    const i18n = setupI18n({
      locale: "cs",
      messages: {
        cs: {},
      },
    })
    i18n.on = jest.fn(() => jest.fn())

    expect(i18n.on).not.toBeCalled()
    render(
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    )
    expect(i18n.on).toBeCalledWith("change", expect.any(Function))
  })

  it("should unsubscribe for locale changes on unmount", () => {
    const unsubscribe = jest.fn()
    const i18n = setupI18n({
      locale: "cs",
      messages: {
        cs: {},
      },
    })
    i18n.on = jest.fn(() => unsubscribe)

    const { unmount } = render(
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    )
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
      return <span data-testid="dynamic">2_{i18n.locale}</span>
    }

    const { container } = render(
      <I18nProvider i18n={i18n}>
        <CurrentLocaleStatic />
        <CurrentLocaleContextConsumer />
      </I18nProvider>
    )

    // First render — locale isn't activated
    expect(container.textContent).toEqual("")

    act(() => {
      i18n.load("cs", {})
    })
    // Catalog is loaded, but locale still isn't activated.
    expect(container.textContent).toEqual("")

    act(() => {
      i18n.activate("cs")
    })

    // After loading and activating locale, components are rendered for the first time
    expect(container.textContent).toEqual("1_cs2_cs")
  })

  it("should render children", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: { en: {} },
    })

    const child = <div data-testid="child" />
    const { getByTestId } = render(
      <I18nProvider i18n={i18n}>{child}</I18nProvider>
    )
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
      const message = useMemo(() => _(greetingId), [_])
      return <div>{message}</div>
    }

    const { getByText } = render(
      <I18nProvider i18n={i18n}>
        <ComponentWithMemo />
      </I18nProvider>
    )

    expect(getByText("Hello World")).toBeTruthy()

    act(() => {
      i18n.activate("cs")
    })

    expect(getByText("Ahoj světe")).toBeTruthy()
  })

  it("when re-rendered with new i18n instance, it will forward it to children", () => {
    const i18nCs = setupI18n({
      locale: "cs",
      messages: { cs: {} },
    })

    const i18nEn = setupI18n({
      locale: "en",
      messages: { en: {} },
    })

    const CurrentLocaleContextConsumer = () => {
      const { i18n } = useLingui()
      return <span data-testid="dynamic">{i18n.locale}</span>
    }

    const { container, rerender } = render(
      <I18nProvider i18n={i18nCs}>
        <CurrentLocaleContextConsumer />
      </I18nProvider>
    )

    expect(container.textContent).toEqual("cs")

    rerender(
      <I18nProvider i18n={i18nEn}>
        <CurrentLocaleContextConsumer />
      </I18nProvider>
    )
    expect(container.textContent).toEqual("en")
  })
})
