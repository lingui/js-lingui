import { type MessageDescriptor } from "@lingui/core"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

import { useI18n } from "../plugins/lingui"

//

function isTD(strings: unknown): strings is TemplateStringsArray {
  return Array.isArray(strings)
}

export function vt(
  stringsOrMD: TemplateStringsArray | MessageDescriptor,
  ...args: Array<unknown>
) {
  const i18n = useI18n()
  if (isTD(stringsOrMD)) {
    const message = stringsOrMD.reduce((msg, current, index) => {
      if (index === 0) {
        return current
      }
      return `${msg}{${index - 1}}${current}`
    }, "")
    const values: Record<string, unknown> = {}
    for (let index = 0; index < args.length; index++) {
      values[index] = args[index]
    }
    return i18n.t(generateMessageId(message), values)
  }
  return i18n.t(stringsOrMD.id, stringsOrMD.values, {
    message: stringsOrMD.message || "fallback message",
  })
}

/**
 * Internal method used by Vue macro
 */
;(vt as any)._ = (descriptor: MessageDescriptor) => {
  const i18n = useI18n()
  return i18n._(descriptor)
}
