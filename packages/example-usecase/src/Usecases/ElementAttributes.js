import React from 'react'
import { WithI18n, Trans } from 'lingui-react'
import type { WithI18nProps } from 'lingui-react'

type ElementAttributesProps = WithI18nProps

class ElementAttributes extends React.Component {
  props: ElementAttributesProps

  render () {
    const { i18n } = this.props
    const articleName = 'Scientific Journal'
    return (
      <div>
        <Trans>Read <a href="/more" title={i18n.t`Full content of ${articleName}`}>more</a></Trans>
      </div>
    )
  }
}

export default WithI18n()(ElementAttributes)
