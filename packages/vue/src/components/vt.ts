import { type MessageDescriptor } from "@lingui/core"

import { useI18n } from "../plugins/lingui"
import { type MacroMessageDescriptor } from "@lingui/core/macro"

export function vt(descriptor: MacroMessageDescriptor): string
export function vt(
  literals: TemplateStringsArray,
  ...placeholders: any[]
): string
export function vt(...args: any[]): any {}

/**
 * Internal runtime used by Vue macro
 * @internal
 */
;(vt as any)._ = (descriptor: MessageDescriptor) => {
  const i18n = useI18n()
  return i18n._(descriptor)
}
