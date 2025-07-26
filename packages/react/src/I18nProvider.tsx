import React, { ComponentType } from "react"
import type { I18n } from "@lingui/core"
import type { TransRenderProps } from "./TransNoContext"

export type I18nContext = {
  i18n: I18n
  _: I18n["_"]
  defaultComponent?: ComponentType<TransRenderProps>
}

export type I18nProviderProps = Omit<I18nContext, "_"> & {
  children?: React.ReactNode
}

export const LinguiContext = React.createContext<I18nContext | null>(null)

export const useLinguiInternal = (devErrorMessage?: string): I18nContext => {
  const context = React.useContext(LinguiContext)

  if (process.env.NODE_ENV !== "production") {
    if (context == null) {
      throw new Error(
        devErrorMessage ?? "useLingui hook was used without I18nProvider."
      )
    }
  }

  return context as I18nContext
}
export function useLingui(): I18nContext {
  return useLinguiInternal()
}

export function I18nProvider({
  i18n,
  defaultComponent,
  children,
}: I18nProviderProps) {
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
      _: i18n.t.bind(i18n),
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
