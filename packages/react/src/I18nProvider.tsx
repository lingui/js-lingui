import React, { ComponentType, FunctionComponent } from "react"
import { I18n } from "@lingui/core"
import { TransRenderProps } from "./Trans"

export type I18nContext = {
  i18n: I18n
  defaultComponent?: ComponentType<TransRenderProps>
}

export type I18nProviderProps = I18nContext & {
  children?: React.ReactNode
}

export const LinguiContext = React.createContext<I18nContext>(null)

export function useLingui(): I18nContext {
  const context = React.useContext<I18nContext>(LinguiContext)

  if (process.env.NODE_ENV !== "production") {
    if (context == null) {
      throw new Error("useLingui hook was used without I18nProvider.")
    }
  }

  return context
}

export const I18nProvider: FunctionComponent<I18nProviderProps> = ({
  i18n,
  defaultComponent,
  children,
}) => {
  const latestKnownLocale = React.useRef<string | undefined>(i18n.locale)
  /**
   * We can't pass `i18n` object directly through context, because even when locale
   * or messages are changed, i18n object is still the same. Context provider compares
   * reference identity and suggested workaround is to create a wrapper object every time
   * we need to trigger re-render. See https://reactjs.org/docs/context.html#caveats.
   *
   * Due to this effect we also pass `defaultComponent` in the same context, instead
   * of creating a separate Provider/Consumer pair.
   *
   * We can't use useMemo hook either, because we want to recalculate value manually.
   */
  const makeContext = React.useCallback(
    () => ({
      i18n,
      defaultComponent,
    }),
    [i18n, defaultComponent]
  )

  const [context, setContext] = React.useState<I18nContext>(makeContext())

  /**
   * Subscribe for locale/message changes
   *
   * I18n object from `@lingui/core` is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of LinguiContext.Consumers.
   */
  React.useEffect(() => {
    const updateContext = () => {
      latestKnownLocale.current = i18n.locale
      setContext(makeContext())
    }
    const unsubscribe = i18n.on("change", updateContext)

    /**
     * unlikely, but if the locale changes before the onChange listener
     * was added, we need to trigger a rerender
     * */
    if (latestKnownLocale.current !== i18n.locale) {
      updateContext()
    }
    return unsubscribe
  }, [i18n, makeContext])

  if (!latestKnownLocale.current) {
    process.env.NODE_ENV === "development" &&
      console.log(
        "I18nProvider rendered `null`. A call to `i18n.activate` needs to happen in order for translations to be activated and for the I18nProvider to render." +
          "This is not an error but an informational message logged only in development."
      )
    return null
  }

  return (
    <LinguiContext.Provider value={context}>{children}</LinguiContext.Provider>
  )
}
