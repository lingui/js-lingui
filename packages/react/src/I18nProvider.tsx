import React, { FunctionComponent } from "react"
import { i18n as i18nGlobal, I18n } from "@lingui/core"
import type { TransRenderType } from "./Trans"

type I18nContext = {
  i18n: I18n
  defaultRender?: TransRenderType
  optOutFromChanges?: boolean
}

export type I18nProviderProps = {} & I18nContext

const LinguiContext = React.createContext<I18nContext>(null)

export function useLingui(): I18nContext {
  const context = React.useContext(LinguiContext)

  if (process.env.NODE_ENV !== "production") {
    if (context == null) {
      throw new Error("useLingui hook was used without I18nProvider.")
    }
  }

  return context
}

export const I18nProvider: FunctionComponent<I18nProviderProps> = (props) => {
  const [context, setContext] = React.useState<I18nContext>(makeContext())

  /**
   * Subscribe for locale/message changes
   *
   * I18n object from `@lingui/core` is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of LinguiContext.Consumers.
   */
  React.useEffect(() => {
    if (props.optOutFromChanges !== true) {
      const unsubscribe = props.i18n.on("change", () =>
        setContext(makeContext())
      )
      return () => unsubscribe()
    }
  }, [props.optOutFromChanges])

  /**
   * We can't pass `i18n` object directly through context, because even when locale
   * or messages are changed, i18n object is still the same. Context provider compares
   * reference identity and suggested workaround is create a wrapper object every time
   * we need to trigger re-render. See https://reactjs.org/docs/context.html#caveats.
   *
   * Due to this effect we also pass `defaultRender` in the same context, instead
   * of creating a separate Provider/Consumer pair.
   *
   * We can't use useMemo hook either, because we want to recalculate value manually.
   */
  function makeContext() {
    return {
      i18n: props.i18n,
      defaultRender: props.defaultRender,
    }
  }

  return (
    <LinguiContext.Provider value={context}>
      {props.children}
    </LinguiContext.Provider>
  )
}
