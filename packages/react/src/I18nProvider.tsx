import React, { FunctionComponent } from "react"
import { I18n } from "@lingui/core"
import { TransRenderType } from "./Trans"

type I18nContext = {
  i18n: I18n
  defaultRender?: TransRenderType
}

export type I18nProviderProps = I18nContext & {
  forceRenderOnLocaleChange?: boolean
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

export function withI18n(o: Object = {}): <P extends Object>(WrappedComponent: React.FunctionComponent<P>) => React.ComponentClass<P> {
  return <P extends Object>(WrappedComponent: React.FunctionComponent<P>) => {
    if (process.env.NODE_ENV !== "production") {
      if (typeof o === "function" || React.isValidElement(o)) {
        throw new Error(
          "withI18n([options]) takes options as a first argument, " +
            "but received React component itself. Without options, the Component " +
            "should be wrapped as withI18n()(Component), not withI18n(Component)."
        )
      }
    }

    return class extends React.Component<P> {
      static contextType = LinguiContext
      context!: React.ContextType<typeof LinguiContext>
      render() {
        if (this.context == null) {
          throw new Error("withI18n() HOC was used without I18nProvider.")
        }
        const { i18n } = this.context;
        return (
          <WrappedComponent {...this.props} i18n={i18n} />
        );
      }
    }

  };
}
export const I18nProvider: FunctionComponent<I18nProviderProps> = ({
  i18n,
  defaultRender,
  forceRenderOnLocaleChange = true,
  children,
}) => {
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
  const makeContext = () => ({
    i18n,
    defaultRender,
  })

  const [context, setContext] = React.useState<I18nContext>(makeContext())

  /**
   * Subscribe for locale/message changes
   *
   * I18n object from `@lingui/core` is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of LinguiContext.Consumers.
   */
  React.useEffect(() => {
    const unsubscribe = i18n.on("change", () => setContext(makeContext()))
    return () => unsubscribe()
  }, [])

  const renderKey = forceRenderOnLocaleChange && i18n.locale
  if (forceRenderOnLocaleChange && !renderKey) return null

  return (
    <LinguiContext.Provider value={context} key={renderKey}>
      {children}
    </LinguiContext.Provider>
  )
}
