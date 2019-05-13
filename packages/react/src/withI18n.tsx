import * as React from "react"
import hoistStatics from "hoist-non-react-statics"

import { I18n as I18nType } from "@lingui/core"
import { I18n } from "@lingui/react"

export type withI18nProps = {
  i18n: I18nType
}

function makeWithI18n({ withHash = false } = {}) {
  return function(WrappedComponent) {
    const WithI18n = React.forwardRef(function(props, ref) {
      return (
        <I18n>
          {({ i18n }) => (
            <WrappedComponent
              {...props}
              ref={ref}
              i18n={i18n}
              i18nHash={withHash ? i18n.locale : undefined}
            />
          )}
        </I18n>
      )
    })

    return hoistStatics(WithI18n, WrappedComponent)
  }
}

export const withI18n = makeWithI18n()
export const withI18nForPure = makeWithI18n({ withHash: true })
