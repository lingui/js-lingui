import { TransProps, TransNoContext } from "./TransNoContext"
import React from "react"
import { getI18n } from "./server"

export function TransRsc(
  props: TransProps
): React.ReactElement<any, any> | null {
  const i18n = getI18n()
  if (!i18n) {
    throw new Error(
      "You tried to use `Trans` in Server Component, but i18n instance for RSC hasn't been setup.\nMake sure to call `setI18n` in root of your page"
    )
  }
  return <TransNoContext {...props} lingui={{ i18n }} />
}
