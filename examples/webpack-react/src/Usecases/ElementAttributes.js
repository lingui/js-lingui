// @flow
import * as React from "react"
import { I18n } from "@lingui/react"
import { t, Trans } from "@lingui/macro"

export default function ElementAttributes() {
  const articleName = "Scientific Journal"
  const closeLabel = t`Close`

  return (
    <I18n>
      {({ i18n }) => (
        <div>
          <a
            className="expression"
            href="/article"
            title={i18n._(t`Full content of ${articleName}`)}
          >
            <Trans>Article</Trans>
          </a>
          <button className="variable" aria-label={i18n._(closeLabel)}>
            X
          </button>
        </div>
      )}
    </I18n>
  )
}
