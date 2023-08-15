import React from "react"

import { useLingui } from "./I18nProvider"
import { TransNoContext, TransProps } from "./TransNoContext"

export function Trans(props: TransProps): React.ReactElement<any, any> | null {
  const lingui = useLingui()
  return React.createElement(TransNoContext, { ...props, lingui })
}
