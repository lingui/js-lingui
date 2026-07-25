import {
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  useContext,
  type Accessor,
  type Component,
  type JSXElement,
  type ParentProps,
} from "solid-js"
import type { I18n } from "@lingui/core"
import type { TransRenderProps } from "./TransNoContext"

export type I18nContext = {
  i18n: Accessor<I18n>
  _: I18n["_"]
  defaultComponent?: Accessor<Component<TransRenderProps> | undefined>
}

export type I18nProviderProps = ParentProps<{
  i18n: I18n
  defaultComponent?: Component<TransRenderProps>
}>

export const LinguiContext = createContext<I18nContext | null>(null)

export const useLinguiInternal = (devErrorMessage?: string): I18nContext => {
  const context = useContext(LinguiContext)

  if (process.env.NODE_ENV !== "production" && context == null) {
    throw new Error(
      devErrorMessage ?? "useLingui hook was used without I18nProvider.",
    )
  }

  return context as I18nContext
}

export function useLingui(): I18nContext {
  return useLinguiInternal()
}

export function I18nProvider(props: I18nProviderProps): JSXElement {
  const [latestKnownLocale, setLatestKnownLocale] = createSignal<string | null>(
    props.i18n.locale || null,
  )
  const [i18nSignal, setI18nSignal] = createSignal(props.i18n, {
    equals: false,
  })
  const defaultComponent = createMemo(() => props.defaultComponent)

  const translate: I18n["_"] = ((...args: Parameters<I18n["_"]>) => {
    const i18n = i18nSignal()
    return i18n.t(...args)
  }) as I18n["_"]

  const context: I18nContext = {
    i18n: i18nSignal,
    _: translate,
    defaultComponent,
  }

  createEffect(
    on(
      () => props.i18n,
      (i18n, previousI18n) => {
        const previousKnownI18n = previousI18n ?? i18n

        const contextNeedsUpdate = () =>
          previousKnownI18n !== i18n || latestKnownLocale() !== i18n.locale

        const updateContext = () => {
          setLatestKnownLocale(i18n.locale || null)
          setI18nSignal(() => i18n)
        }

        const unsubscribe = i18n.on("change", updateContext)

        if (contextNeedsUpdate()) {
          updateContext()
        }

        onCleanup(unsubscribe)
      },
    ),
  )

  const RenderFallback = (): JSXElement => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "I18nProvider rendered `null`. A call to `i18n.activate` needs to happen in order for translations to be activated and for the I18nProvider to render." +
          "This is not an error but an informational message logged only in development.",
      )
    }
    return null
  }

  return (
    <Show when={latestKnownLocale() !== null} fallback={<RenderFallback />}>
      <LinguiContext.Provider value={context}>
        {props.children}
      </LinguiContext.Provider>
    </Show>
  )
}
