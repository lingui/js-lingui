import React, { ComponentType, FunctionComponent } from "react"
import { I18n } from "@lingui/core"
import { TransRenderProps } from "./Trans"

export type I18nContext = {
  i18n: I18n
  defaultComponent?: ComponentType<TransRenderProps>
}

export type withI18nProps = {
  i18n: I18n
}

export type I18nProviderProps = I18nContext & {
  forceRenderOnLocaleChange?: boolean
  children?: React.ReactNode
}

const LinguiContext = React.createContext<I18nContext>(null)

export function useLingui(): I18nContext {
  const context = React.useContext<I18nContext>(LinguiContext)

  if (process.env.NODE_ENV !== "production") {
    if (context == null) {
      throw new Error("useLingui hook was used without I18nProvider.")
    }
  }

  return context
}

export function withI18n(
  o?: object
): <P extends withI18nProps>(
  Component: ComponentType<P>
) => React.ComponentType<Omit<P, "i18n">> {
  return <P extends withI18nProps>(
    WrappedComponent: ComponentType<P>
  ): ComponentType<P> => {
    return (props) => {
      if (process.env.NODE_ENV !== "production") {
        if (typeof o === "function" || React.isValidElement(o)) {
          throw new Error(
            "withI18n([options]) takes options as a first argument, " +
              "but received React component itself. Without options, the Component " +
              "should be wrapped as withI18n()(Component), not withI18n(Component)."
          )
        }
      }

      const { i18n } = useLingui()
      return <WrappedComponent {...props} i18n={i18n} />
    }
  }
}

export const I18nProvider: FunctionComponent<I18nProviderProps> = ({
  i18n,
  defaultComponent,
  forceRenderOnLocaleChange = true,
  children,
}) => {
  /**
   * We can't pass `i18n` object directly through context, because even when locale
   * or messages are changed, i18n object is still the same. Context provider compares
   * reference identity and suggested workaround is create a wrapper object every time
   * we need to trigger re-render. See https://reactjs.org/docs/context.html#caveats.
   *
   * Due to this effect we also pass `defaultComponent` in the same context, instead
   * of creating a separate Provider/Consumer pair.
   *
   * We can't use useMemo hook either, because we want to recalculate value manually.
   */
  const makeContext = () => ({
    i18n,
    defaultComponent,
  })
  const getRenderKey = () => {
    return (
      forceRenderOnLocaleChange ? i18n.locale || "default" : "default"
    ) as string
  }

  const [context, setContext] = React.useState<I18nContext>(makeContext()),
    [renderKey, setRenderKey] = React.useState<string>(getRenderKey())

  /**
   * Subscribe for locale/message changes
   *
   * I18n object from `@lingui/core` is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of LinguiContext.Consumers.
   *
   * We call `setContext(makeContext())` after adding the observer in case the `change`
   * event would already have fired between the inital renderKey calculation and the
   * `useEffect` hook being called. This can happen if locales are loaded/activated
   * async.
   */
  React.useEffect(() => {
    const unsubscribe = i18n.on("change", () => {
      setContext(makeContext())
      setRenderKey(getRenderKey())
    })
    if (renderKey === "default") {
      setRenderKey(getRenderKey())
    }
    if (forceRenderOnLocaleChange && renderKey === "default") {
      console.log(
        "I18nProvider did not render. A call to i18n.activate still needs to happen or forceRenderOnLocaleChange must be set to false."
      )
    }
    return () => unsubscribe()
  }, [])

  if (forceRenderOnLocaleChange && renderKey === "default") return null

  return (
    <LinguiContext.Provider value={context} key={renderKey}>
      {children}
    </LinguiContext.Provider>
  )
}
