import {
  computed,
  defineComponent,
  inject,
  provide,
  shallowRef,
  triggerRef,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type ShallowRef,
} from "vue"
import type { I18n } from "@lingui/core"

/**
 * Component rendering every `Trans` translation by default. It receives
 * `id`, `message` and `translation` (see `TransRenderProps`) as props and
 * the translation as its default slot.
 */
export type I18nDefaultComponent = Component

export type I18nContext = {
  /**
   * Reactive reference to the `I18n` instance. It is triggered whenever the
   * active locale or the loaded catalogs change, so reading `i18n.value.locale`
   * in a template or a `computed` re-evaluates automatically.
   */
  i18n: ShallowRef<I18n>
  /**
   * Reactive translate function. Equivalent to `i18n.value._` but tracks the
   * instance, so components using it re-render when the locale changes.
   */
  _: I18n["_"]
  /**
   * Alias of `_`. Template code compiled by `@lingui/vue/compiler`
   * (`t\`Hello\`` → `t({ id, message })`) calls this function.
   */
  t: I18n["_"]
  defaultComponent?: I18nDefaultComponent
}

export type I18nProviderProps = {
  i18n: I18n
  defaultComponent?: I18nDefaultComponent
}

export const LinguiInjectionKey: InjectionKey<I18nContext> = Symbol(
  process.env.NODE_ENV !== "production" ? "lingui" : "",
)

/**
 * Create the reactive context value shared through `LinguiInjectionKey`.
 *
 * The returned `subscribe` function must be called to start forwarding
 * `i18n` "change" events to the reactive reference.
 */
export function createI18nContext(
  i18n: I18n,
  getDefaultComponent: () => I18nDefaultComponent | undefined = () => undefined,
): { context: I18nContext; i18nRef: ShallowRef<I18n> } {
  const i18nRef = shallowRef(i18n)

  const translate: I18n["_"] = ((...args: Parameters<I18n["_"]>) => {
    return i18nRef.value._(...args)
  }) as I18n["_"]

  const context: I18nContext = {
    i18n: i18nRef,
    _: translate,
    t: translate,
    get defaultComponent() {
      return getDefaultComponent()
    },
  }

  return { context, i18nRef }
}

export const useLinguiInternal = (devErrorMessage?: string): I18nContext => {
  const context = inject(LinguiInjectionKey, null)

  if (process.env.NODE_ENV !== "production" && context == null) {
    throw new Error(
      devErrorMessage ??
        "useLingui hook was used without I18nProvider." +
          "\n\nThis often happens when multiple instances of @lingui/vue are installed " +
          "(e.g. due to a version mismatch or misconfiguration in a monorepo). " +
          "Verify you have only one version installed by running: " +
          "npm ls @lingui/vue (or pnpm why @lingui/vue / yarn why @lingui/vue).",
    )
  }

  return context as I18nContext
}

export function useLingui(): I18nContext {
  return useLinguiInternal()
}

export const I18nProvider = defineComponent({
  name: "I18nProvider",
  props: {
    i18n: { type: Object as PropType<I18n>, required: true as const },
    defaultComponent: {
      type: [Object, Function] as PropType<I18nDefaultComponent>,
      required: false,
    },
  },
  setup(props, { slots }) {
    const { context, i18nRef } = createI18nContext(
      props.i18n,
      () => props.defaultComponent,
    )

    watch(
      () => props.i18n,
      (i18n, _previousI18n, onCleanup) => {
        i18nRef.value = i18n
        // The instance identity never changes on locale switch, so force
        // dependents to re-run.
        triggerRef(i18nRef)

        const unsubscribe = i18n.on("change", () => triggerRef(i18nRef))
        onCleanup(unsubscribe)
      },
      { immediate: true },
    )

    provide(LinguiInjectionKey, context)

    // Only the `null` → locale transition matters to the provider itself.
    // Tracking this boolean (rather than `i18nRef` directly) means the
    // provider does not re-render its slot on every i18n "change" event,
    // e.g. `load()` of a non-active locale. Consumers still track `i18nRef`.
    const hasLocale = computed(() => Boolean(i18nRef.value.locale))

    return () => {
      if (!hasLocale.value) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "I18nProvider rendered `null`. A call to `i18n.activate` needs to happen in order for translations to be activated and for the I18nProvider to render." +
              "This is not an error but an informational message logged only in development.",
          )
        }
        return null
      }

      return slots.default?.()
    }
  },
})
