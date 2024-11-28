import type { I18n } from "@lingui/core"
import { createContext, Accessor, createSignal, onCleanup, on, ParentComponent, useContext, createMemo, Show, createEffect } from "solid-js"
import type { TransRenderProps } from "./TransNoContext"

export type I18nContext = {
  i18n: Accessor<I18n>
  _: I18n["_"]
  defaultComponent: Accessor<ParentComponent<TransRenderProps> | undefined>
}

export type I18nProviderProps = {
  i18n: I18n
  defaultComponent?: ParentComponent<TransRenderProps>
}

export const LinguiContext = createContext<I18nContext | null>(null)

export const useLinguiInternal = (devErrorMessage?: string): I18nContext => {
  const context = useContext(LinguiContext)

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

export const I18nProvider: ParentComponent<I18nProviderProps> = (props) => {
  // eslint-disable-next-line solid/reactivity
  const [latestKnownLocale, setLatestKnownLocale] = createSignal<string | undefined>(props.i18n.locale)
  let unsubscribe: () => void
  // eslint-disable-next-line solid/reactivity
  const [i18n, setI18n] = createSignal(props.i18n, { equals: (_, next) => next.locale != latestKnownLocale() })
  const defaultComponent = createMemo(() => props.defaultComponent)
  const _: I18n["_"] = ((...args: any[]) => (i18n()._ as Function).apply(i18n(), args));

  /**
   * Subscribe for locale/message changes
   *
   * I18n object from `@lingui/core` is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of LinguiContext.Consumers.
   */
  createEffect(on([() => props.i18n, () => props.defaultComponent], () => {
    const updateContext = () => {
      setLatestKnownLocale(props.i18n.locale)
      setI18n(props.i18n)
    }

    if (unsubscribe)
      unsubscribe();
    unsubscribe = props.i18n.on("change", updateContext)

    /**
     * unlikely, but if the locale changes before the onChange listener
     * was added, we need to trigger a rerender
     * */
    if (latestKnownLocale() !== props.i18n.locale) {
      updateContext()
    }
  }));

  onCleanup(() => unsubscribe())

  createEffect(() => {
    if (!latestKnownLocale()) {
      process.env.NODE_ENV === "development" &&
      console.log(
        "I18nProvider rendered `<></>`. A call to `i18n.activate` needs to happen in order for translations to be activated and for the I18nProvider to render." +
        "This is not an error but an informational message logged only in development."
      )
      return null
    }
  })

  return (
    <LinguiContext.Provider value={{ i18n, defaultComponent, _ }}>
      <Show when={!!latestKnownLocale()}>
        {props.children}
      </Show>
    </LinguiContext.Provider>
  )
}
