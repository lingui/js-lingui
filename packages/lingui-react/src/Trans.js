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
} & WithI18nProps & RenderProps

type TransState = {
  language: string,
  translation: string
}

class Trans extends React.Component {
  props: TransProps
  state: TransState

  static defaultProps = {
    id: '',
    i18n: {}
  }

  constructor (props) {
    super(props)

    const translation = this.getTranslation()

    if (process.env.NODE_ENV !== 'production') {
      if (!translation && props.children) {
        console.warn(
          'lingui-react preset is probably missing in babel config. ' +
          'It causes that no content is rendered from any lingui-react ' +
          'components. See installation guide for more info - ' +
          'https://l.lingui.io/tutorial-i18n-react'
        )
      }
    }

    this.state = {
      language: props.i18n.language,
      translation
    }
  }

  getTranslation (): string {
    const { id = '', defaults, i18n, params, formats } = this.props
    return typeof i18n._ === 'function' ? i18n._({ id, defaults, params, formats }) : id
  }

  render () {
    const { components } = this.props
    const translation = formatElements(this.getTranslation(), components)

    const { className, render } = this.props
    return <Render className={className} render={render}>{translation}</Render>
  }
}

export default WithI18n()(Trans)
