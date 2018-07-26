// @flow
import * as React from "react"
import { withI18n } from "@lingui/react"
import { Trans } from "@lingui/react.macro"
import { t } from "@lingui/js.macro"

type ElementAttributesProps = {
  i18n: Object
}

class ElementAttributes extends React.Component<ElementAttributesProps> {
  props: ElementAttributesProps

  render() {
    const { i18n } = this.props
    const articleName = "Scientific Journal"
    const closeLabel = t`Close`

    return (
      <div>
        <Trans>
          <a
            className="expression"
            href="/article"
            title={t`Full content of ${articleName}`}
          >
            Article
          </a>
        </Trans>
        <button className="variable" aria-label={closeLabel}>
          X
        </button>
      </div>
    )
  }
}

export default withI18n()(ElementAttributes)
