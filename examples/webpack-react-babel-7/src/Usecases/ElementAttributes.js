// @flow
import * as React from "react"
import { withI18n, Trans } from "@lingui/react"

type ElementAttributesProps = {
  i18n: Object
}

class ElementAttributes extends React.Component<ElementAttributesProps> {
  props: ElementAttributesProps

  render() {
    const { i18n } = this.props
    const articleName = "Scientific Journal"
    const closeLabel = i18n.t`Close`

    return (
      <div>
        <Trans>
          <a
            className="expression"
            href="/article"
            title={i18n.t`Full content of ${articleName}`}
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
