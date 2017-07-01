// @flow
import React from 'react'

import WithI18n from './WithI18n'
import type { WithI18nProps } from './WithI18n'
import { formatElements } from './format'

import type { RenderProps } from './Render'
import Render from './Render'

type TransProps = {
  id?: string,
  defaults?: string,
  params?: Object,
  formats?: Object,
  components?: Array<React$Element<*>>,
  i18n: Object,
  children?: any
} & WithI18nProps & RenderProps

class Trans extends React.Component {
  props: TransProps

  componentDidMount () {
    if (process.env.NODE_ENV !== 'production') {
      if (!this.getTranslation() && this.props.children) {
        console.warn(
          'lingui-react preset is probably missing in babel config. ' +
          'It causes that no content is rendered from any lingui-react ' +
          'components. See installation guide for more info - ' +
          'https://l.lingui.io/tutorial-i18n-react'
        )
      }
    }
  }

  getTranslation (): string {
    const { id = '', defaults, i18n, params, formats } = this.props
    return i18n && typeof i18n._ === 'function'
      ? i18n._({ id, defaults, params, formats })
      // i18n provider isn't loaded at all
      : id
  }

  render () {
    const translation = formatElements(this.getTranslation(), this.props.components)
    return <Render className={this.props.className} render={this.props.render}>{translation}</Render>
  }
}

export default WithI18n()(Trans)
