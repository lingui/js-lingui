import * as React from "react"

import { defaultLocale } from "../i18n"

export default class LocaleSwitch extends React.Component {
  state = {
    locale: defaultLocale,
    catalogs: {}
  }

  componentDidMount() {
    this.loadCatalog(this.state.locale)
  }

  loadCatalog = async locale => {
    const { default: catalog } = await this.props.loadCatalog(locale)

    this.setState(state => ({
      locale,
      catalogs: {
        ...state.catalogs,
        [locale]: catalog
      }
    }))
  }

  activate = locale => {
    if (!this.state.catalogs[locale]) {
      // Load catalog and switch locale.
      this.loadCatalog(locale)
    } else {
      // Catalog is already loaded, just switch locale.
      this.setState({ locale })
    }
  }

  render() {
    const { catalogs, locale } = this.state
    // catalog is being loaded, render nothing
    if (!catalogs[locale]) return null

    return this.props.children({
      locale,
      catalogs,
      activate: this.activate
    })
  }
}
