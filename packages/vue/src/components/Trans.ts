import { defineComponent, type MaybeRef, type PropType, unref } from "vue"

import { useI18n } from "../plugins/lingui"
import { formatElements } from "./format"

//

type Values = Record<string, MaybeRef>

// eslint-disable-next-line import/no-default-export
export default defineComponent({
  props: {
    id: { type: String, required: false },
    values: { type: Object as PropType<Values>, required: false },
    message: { type: String, required: false },
    context: { type: String, required: false },
  },
  setup(props, ctx) {
    return () => {
      if (!props.id) return ""
      const i18n = useI18n()
      const unrefValues = Object.fromEntries(
        Object.entries(props.values || {}).map(([key, value]) => [
          key,
          unref(value),
        ])
      )
      const translation = i18n.t(props.id, unrefValues, {
        message: props.message || "fallback message",
      })
      return formatElements(translation, { ...ctx.slots })
    }
  },
})
