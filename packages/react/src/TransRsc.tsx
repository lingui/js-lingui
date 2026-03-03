import { TransProps, TransNoContext } from "./TransNoContext"
import { getI18n } from "./server"

export function TransRsc(
  props: TransProps,
): React.ReactElement<any, any> | null {
  const ctx = getI18n()
  if (!ctx) {
    throw new Error(
      "You tried to use `Trans` in Server Component, but i18n instance for RSC hasn't been setup.\nMake sure to call `setI18n` in the root of your page.",
    )
  }
  return <TransNoContext {...props} lingui={ctx} />
}
