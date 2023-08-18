import React, {
  ComponentType,
  FunctionComponent,
  useCallback,
  useRef,
} from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

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

export function useLingui(): I18nContext {
  const context = React.useContext(LinguiContext)

  if (process.env.NODE_ENV !== "production") {
    if (context == null) {
      throw new Error("useLingui hook was used without I18nProvider.")
    }
  }

  return context as I18nContext
}

export const I18nProvider: FunctionComponent<I18nProviderProps> = ({
  i18n,
  defaultComponent,
  children,
}) => {
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
  const makeContext = useCallback(
    () => ({
      i18n,
      defaultComponent,
      _: i18n.t.bind(i18n),
    }),
    [i18n, defaultComponent]
  )
  const context = useRef<I18nContext>(makeContext())

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const renderWithFreshContext = () => {
        context.current = makeContext()
        onStoreChange()
      }
      const propsChanged =
        context.current.i18n !== i18n ||
        context.current.defaultComponent !== defaultComponent
      if (propsChanged) {
        renderWithFreshContext()
      }
      return i18n.on("change", renderWithFreshContext)
    },
    [makeContext, i18n, defaultComponent]
  )

  const getSnapshot = useCallback(() => {
    return context.current
  }, [])

  /**
   * Subscribe for locale/message changes
   *
   * the I18n object passed via props is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of LinguiContext consumers.
   */
  const contextObject = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  )

  if (!contextObject.i18n.locale) {
    process.env.NODE_ENV === "development" &&
      console.log(
        "I18nProvider rendered `null`. A call to `i18n.activate` needs to happen in order for translations to be activated and for the I18nProvider to render." +
          "This is not an error but an informational message logged only in development."
      )
    return null
  }

  return (
    <LinguiContext.Provider value={contextObject}>
      {children}
    </LinguiContext.Provider>
  )
}
