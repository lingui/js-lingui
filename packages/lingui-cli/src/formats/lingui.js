// @flow
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'

import type { CatalogFormat } from './interface'
import * as locales from './utils/locales'

const sourceFilename = '{locale}/messages.json'
const compiledFilename = '{locale}/messages.js'

export default (config): CatalogFormat => ({
  formatFilename (pattern, locale) {
    return pattern.replace('{locale}', locale)
  },

  write (locale, messages) {
    const filename = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, locale)
    )
    fs.writeFileSync(filename, JSON.stringify(messages))
  },

  read (locale) {

  },

  locales () {
    const pattern = this.formatfilename(sourceFilename, locales.localeRe)
    return fs
      .readdirSync(config.localeDir)
      .filter(dirname =>
        /^$/i.test(dirname) &&
        fs.lstatSync(path.join(config.localeDir, dirname)).isDirectory() &&
        fs.existsSync(path.join(config.localeDir, dirname))
      )
  },

  addLocale (locale: string) {
    if (!locales.isValid(locale)) {
      return [false, null]
    }

    const filename = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, locale)
    )

    if (!fs.existsSync(filename)) {
      const dirname = filename.substring(0, filename.lastIndexOf('/'))

      mkdirp.sync(dirname)
      this.write(locale, {})

      return [true, filename]
    }

    return [false, filename]
  }
})
