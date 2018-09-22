// @flow
import * as React from "react"
import hoistStatics from "hoist-non-react-statics"

import type { I18n } from "@lingui/core"
import { I18nCoreConsumer } from "./I18nProvider"

export type withI18nProps = {
  i18n: I18n
}

export default function withI18n<P, C: React.ComponentType<P>>(
  WrappedComponent: C
): C & React.ComponentType<$Diff<P, withI18nProps>> {
  function WithI18n(props) {
    return (
      <I18nCoreConsumer>
        {i18n => <WrappedComponent {...props} i18n={i18n} />}
      </I18nCoreConsumer>
    )
  }

  return hoistStatics(WithI18n, WrappedComponent)
}
