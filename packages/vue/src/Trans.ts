import { defineComponent } from "vue"
import { useLinguiInternal } from "./I18nProvider"
import { renderTrans, transProps, type TransProps } from "./TransNoContext"

export const Trans = defineComponent({
  name: "Trans",
  inheritAttrs: false,
  props: transProps,
  setup(props, { slots }) {
    let errMessage = undefined

    if (process.env.NODE_ENV !== "production") {
      errMessage =
        `Trans component was rendered without I18nProvider. ` +
        `Attempted to render message: ${props.message} id: ${props.id}. ` +
        `Make sure this component is rendered inside a I18nProvider.` +
        `\n\nThis often happens when multiple instances of @lingui/vue are installed ` +
        `(e.g. due to a version mismatch or misconfiguration in a monorepo). ` +
        `Verify you have only one version installed by running: ` +
        `npm ls @lingui/vue (or pnpm why @lingui/vue / yarn why @lingui/vue).`
    }

    const lingui = useLinguiInternal(errMessage)

    return () =>
      renderTrans(
        props as unknown as TransProps,
        slots,
        lingui.i18n.value,
        lingui.defaultComponent,
      )
  },
})

/**
 * `<Plural>`, `<Select>` and `<SelectOrdinal>` exist only at compile time:
 * `@lingui/vue/compiler` turns them into a `Trans` message descriptor. These
 * aliases let templates import them from `@lingui/vue` so the compiled
 * `resolveComponent()`/setup binding still resolves to the `Trans` runtime.
 */
export const Plural = Trans
export const Select = Trans
export const SelectOrdinal = Trans
