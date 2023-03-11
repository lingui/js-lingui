import * as React from "react"
import { act, render } from "@testing-library/react"

import { I18nProvider, useLingui } from "./I18nProvider"
import { setupI18n } from "@lingui/core"

describe("I18nProvider", () => {
  it("should pass i18n context to wrapped component", () => {
    const i18n = setupI18n({
      locale: "cs",
      messages: {
        cs: {},
      },
    })

    const WithoutLingui = (props) => {
      return <div {...props}>{props?.i18n?.locale}</div>
    }

    const WithLingui = (props) => {
      const { i18n } = useLingui()
      return <WithoutLingui i18n={i18n} {...props} />
    }

    const { getByTestId } = render(
      <I18nProvider i18n={i18n}>
        <WithoutLingui data-testid="not-composed" />
        <WithLingui data-testid="composed" />
      </I18nProvider>
    )

    act(() => {
      i18n.load("cs", {})
      i18n.activate("cs")
    })

    expect(getByTestId("not-composed").textContent).toEqual("")
    expect(getByTestId("composed").textContent).toEqual("cs")
  })

  it("should subscribe for locale changes", () => {
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
    expect(i18n.on).toBeCalledWith("change", expect.anything())
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

  test.each([
    {
      forceRenderOnLocaleChange: false,
      expectedTextContent: "",
      expectedRenderCount: 1,
    },
    {
      forceRenderOnLocaleChange: true,
      expectedTextContent: "cs",
      expectedRenderCount: 3, // initial render, load messages, activate locale
    },
  ])(
    "A component that is not consuming i18n context will not re-render on locale change." +
      "A component that consumes i18n context will re-render on locale change, only if forceRenderOnLocaleChange is true.",
    ({
      forceRenderOnLocaleChange,
      expectedTextContent,
      expectedRenderCount,
    }) => {
      expect.assertions(6)

      const i18n = setupI18n()
      let staticRenderCount = 0,
        dynamicRenderCount = 0

      const CurrentLocaleStatic = () => {
        staticRenderCount++
        return <span data-testid="static">{i18n.locale}</span>
      }
      const CurrentLocaleContextConsumer = () => {
        const { i18n } = useLingui()
        dynamicRenderCount++
        return <span data-testid="dynamic">{i18n.locale}</span>
      }

      const { container, getByTestId } = render(
        <I18nProvider
          i18n={i18n}
          forceRenderOnLocaleChange={forceRenderOnLocaleChange}
        >
          <>
            <CurrentLocaleStatic />
            <CurrentLocaleContextConsumer />
          </>
        </I18nProvider>
      )
      // First render — no output, because locale isn't activated
      expect(container.textContent).toEqual("")

      act(() => {
        i18n.load("en", {})
      })
      // Again, no output. Catalog is loaded, but locale
      // still isn't activated.
      expect(container.textContent).toEqual("")

      act(() => {
        i18n.load("cs", {})
        i18n.activate("cs")
      })
      // After loading and activating locale, only CurrentLocaleContextConsumer re-rendered.
      expect(getByTestId("static").textContent).toBe("")
      expect(getByTestId("dynamic").textContent).toBe(expectedTextContent)
      expect(staticRenderCount).toBe(1)
      expect(dynamicRenderCount).toBe(expectedRenderCount)
    }
  )

  it(
    "given 'en' locale, if activate('cs') call happens before i18n.on-change subscription in useEffect(), " +
      "I18nProvider detects that it's stale and re-renders with the 'cs' locale value",
    () => {
      const i18n = setupI18n({
        locale: "en",
        messages: { en: {} },
      })
      let renderCount = 0

      const CurrentLocaleContextConsumer = () => {
        const { i18n } = useLingui()
        renderCount++
        return <span data-testid="child">{i18n.locale}</span>
      }
      /**
       * Note that we're doing exactly what the description says:
       * but to simulate the equivalent situation, we pass our own mock subscriber
       * to i18n.on("change", ...) and then we call i18n.activate("cs") ourselves
       * so that the condition in useEffect() is met and the component re-renders
       * */

      const mockSubscriber = jest.fn(() => {
        i18n.load("cs", {})
        i18n.activate("cs")
        return () => {
          // unsubscriber - noop to make TS happy
        }
      })
      jest.spyOn(i18n, "on").mockImplementation(mockSubscriber)

      const { getByTestId } = render(
        <I18nProvider i18n={i18n}>
          <CurrentLocaleContextConsumer />
        </I18nProvider>
      )

      expect(mockSubscriber).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      )

      expect(getByTestId("child").textContent).toBe("cs")
      expect(renderCount).toBe(2)
    }
  )

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
})
