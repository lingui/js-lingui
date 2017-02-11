// @flow
import I18nProvider from './I18nProvider'
import WithI18n from './WithI18n'
import Trans from './Trans'
import Plural from './Plural'
import Select from './Select'

const InjectI18n = (WrappedComponent: any) => {
  console.warn('DEPRECATED (removal in 1.x): InjectI18n was replaced with WithI18n([ options ])')
  return WithI18n()(WrappedComponent)
}

export { I18nProvider, InjectI18n, WithI18n, Trans, Plural, Select }
