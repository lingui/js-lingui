import { t } from "@lingui/core/macro"

export function showMessage(): void {
  const msg = t`message from a dynamic imported module`
  console.log(msg)
}
