import { createContext, useContext, useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"
import type { I18n } from "@lingui/core"
import type { TransRenderProps } from "./TransNoContext"

export type I18nDefaultComponent = React.ComponentType<TransRenderProps>

export type I18nContext = {
  i18n: I18n
  _: I18n["_"]
  defaultComponent?: I18nDefaultComponent
}

export type I18nProviderProps = Omit<I18nContext, "_"> & {
  children?: React.ReactNode
}

export const LinguiContext = createContext<I18nContext | null>(null)

export const useLinguiInternal = (devErrorMessage?: string): I18nContext => {
  const context = useContext(LinguiContext)

  if (process.env.NODE_ENV !== "production") {
    if (context == null) {
      throw new Error(
        devErrorMessage ?? "useLingui hook was used without I18nProvider.",
      )
    }
  }

  return context as I18nContext
}
export function useLingui(): I18nContext {
  return useLinguiInternal()
}

/**
 * We can't pass the `i18n` object directly through context, because even when
 * locale or messages change, the i18n object keeps the same reference. Context
 * providers compare reference identity, so we create a fresh wrapper object for
 * each context update. See https://reactjs.org/docs/context.html#caveats.
 *
 * We wrap `i18n` in a Proxy to create a new reference on each context update.
 * This ensures React correctly invalidates memoized values that depend on `i18n`.
 */
const getI18nContext = (
  i18n: I18n,
  defaultComponent?: I18nDefaultComponent,
): I18nContext => ({
  i18n: new Proxy(i18n, {}),
  defaultComponent,
  _: i18n.t.bind(i18n),
})

const createI18nStore = (
  i18n: I18n,
  defaultComponent?: I18nDefaultComponent,
) => {
  let latestLocale = i18n.locale
  let context = getI18nContext(i18n, defaultComponent)

  const updateContext = () => {
    latestLocale = i18n.locale
    context = getI18nContext(i18n, defaultComponent)
  }

  const getSnapshot = () => {
    if (latestLocale !== i18n.locale) {
      updateContext()
    }

    return context
  }

  const subscribe = (onStoreChange: () => void) =>
    i18n.on("change", () => {
      updateContext()
      onStoreChange()
    })

  return {
    getSnapshot,
    subscribe,
  }
}

export const I18nProvider = ({
  i18n,
  defaultComponent,
  children,
}: I18nProviderProps) => {
  const store = useMemo(
    () => createI18nStore(i18n, defaultComponent),
    [i18n, defaultComponent],
  )

  /**
   * Subscribe for locale/message changes
   *
   * I18n object from `@lingui/core` is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of LinguiContext.Consumers.
   */
  const context = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  )

  if (!context.i18n.locale) {
    process.env.NODE_ENV === "development" &&
      console.log(
        "I18nProvider rendered `null`. A call to `i18n.activate` needs to happen in order for translations to be activated and for the I18nProvider to render." +
          "This is not an error but an informational message logged only in development.",
      )
    return null
  }

  return (
    <LinguiContext.Provider value={context}>{children}</LinguiContext.Provider>
  )
}
