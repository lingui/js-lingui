import React from 'react'
import { WithI18n, Trans } from 'lingui-react'

type ElementAttributesProps = {
  children: any,
  i18n: Object
}

class ElementAttributes extends React.Component {
  props: ElementAttributesProps

  render () {
    const { i18n } = this.props
    const articleName = 'Scientific Journal'
    const closeLabel = i18n.t`Close`

    return (
      <div>
        <Trans>
          <a
            className="expression"
            href="/article"
            title={i18n.t`Full content of ${articleName}`}>Article</a>
        </Trans>
        <button className="variable" aria-label={closeLabel}>X</button>
      </div>
    )
  }
}

export default WithI18n()(ElementAttributes)
