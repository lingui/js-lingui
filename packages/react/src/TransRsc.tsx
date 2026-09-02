import { TransProps, TransNoContext } from "./TransNoContext"
import { getI18nOrThrow } from "./server"

export function TransRsc(
  props: TransProps,
): React.ReactElement<any, any> | null {
  return <TransNoContext {...props} lingui={getI18nOrThrow()} />
}
