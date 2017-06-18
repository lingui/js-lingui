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
  msgCache: Function,
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

    const translation = this.getTranslation(props)

    if (process.env.NODE_ENV !== 'production') {
      if (!translation && props.children) {
        console.warn(
          'lingui-react preset is probably missing in babel config. ' +
          'It causes that no content is rendered from any lingui-react ' +
          'components. See installation guide for more info - ' +
          'http://bit.ly/lingui-react-quickstart'
        )
      }
    }

    this.state = {
      msgCache: this.compileMessage(translation),
      language: props.i18n.language,
      translation
    }
  }

  getTranslation (props): string {
    const { id = '', defaults, i18n } = props

    return (i18n.messages && id ? i18n.messages[id] : '') || defaults || id
  }

  compileMessage (translation: string): Function {
    const { i18n, formats } = this.props

    if (!i18n.compile) return () => translation
    return i18n.compile(translation, formats)
  }

  componentWillReceiveProps (nextProps) {
    const { i18n } = this.props
    const { language, translation } = this.state
    const nextTranslation = this.getTranslation(nextProps)

    if (
      translation !== nextTranslation ||
      language !== i18n.language
    ) {
      this.setState({
        msgCache: this.compileMessage(nextTranslation),
        language: i18n.language,
        translation: nextTranslation
      })
    }
  }

  render () {
    const { params, components } = this.props
    const { msgCache } = this.state

    const translation = formatElements(msgCache(params), components)

    const { className, render } = this.props
    return <Render className={className} render={render}>{translation}</Render>
  }
}

export default WithI18n()(Trans)
